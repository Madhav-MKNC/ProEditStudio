import { useEffect, useRef } from "react";
import { Canvas as FabricCanvas, IText, Rect, Circle as FabricCircle, Image as FabricImage, FabricObject, Gradient, Path } from "fabric";
import { Layer, TextLayer, ShapeLayer, ImageLayer } from "@/types/editor";

interface ExtendedFabricObject extends FabricObject {
  layerId?: string;
}

interface CanvasRendererProps {
  layers: Layer[];
  selectedLayerId: string | null;
  backgroundImage: string | null;
  onSelectLayer: (id: string | null) => void;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  zoom: number;
  backgroundFit: 'contain' | 'cover' | 'stretch';
  activeTool: string;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  fabricCanvasRef: React.MutableRefObject<FabricCanvas | null>;
  drawingColor: string;
}

export const useCanvasRenderer = ({
  layers,
  selectedLayerId,
  backgroundImage,
  onSelectLayer,
  onUpdateLayer,
  zoom,
  backgroundFit,
  activeTool,
  canvasRef,
  fabricCanvasRef,
  drawingColor,
}: CanvasRendererProps) => {
  const objectsRef = useRef<Map<string, ExtendedFabricObject>>(new Map());

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 1200,
      height: 800,
      backgroundColor: "#1a1a24",
    });

    canvas.preserveObjectStacking = true;
    try {
      canvas.freeDrawingBrush.color = drawingColor;
      canvas.freeDrawingBrush.width = 3;
    } catch {}

    fabricCanvasRef.current = canvas;

    // Selection events
    canvas.on("selection:created", (e) => {
      const obj = e.selected?.[0] as ExtendedFabricObject;
      if (obj?.layerId) onSelectLayer(obj.layerId);
    });

    canvas.on("selection:updated", (e) => {
      const obj = e.selected?.[0] as ExtendedFabricObject;
      if (obj?.layerId) onSelectLayer(obj.layerId);
    });

    canvas.on("selection:cleared", () => {
      onSelectLayer(null);
    });

    // Object modification
    canvas.on("object:modified", (e) => {
      const obj = e.target as ExtendedFabricObject;
      if (obj?.layerId) {
        obj.setCoords();
        canvas.requestRenderAll();
        
        const updates: Partial<Layer> = {
          x: obj.left || 0,
          y: obj.top || 0,
          rotation: obj.angle || 0,
          scaleX: obj.scaleX,
          scaleY: obj.scaleY,
        };

      if (obj instanceof IText) {
        const textLayer = layer as TextLayer;
        updates.text = obj.text || "";
        updates.fontSize = obj.fontSize;
      }

        onUpdateLayer(obj.layerId, updates);
      }
    });

    // Text editing
    canvas.on("text:changed", (e) => {
      const obj = e.target as IText & ExtendedFabricObject;
      if (obj?.layerId) {
        onUpdateLayer(obj.layerId, { text: obj.text || "" });
      }
    });

    // Path created (drawing)
    canvas.on("path:created", (e) => {
      const path = e.path as Path & ExtendedFabricObject;
      if (path && activeTool === 'draw') {
        const layerId = `drawing-${Date.now()}`;
        path.layerId = layerId;
        objectsRef.current.set(layerId, path);
      }
    });

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, []);

  // Update background
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    if (backgroundImage) {
      FabricImage.fromURL(backgroundImage).then((img) => {
        const canvasWidth = canvas.width || 1200;
        const canvasHeight = canvas.height || 800;
        const imgW = img.width || canvasWidth;
        const imgH = img.height || canvasHeight;

        let scaleX = canvasWidth / imgW;
        let scaleY = canvasHeight / imgH;

        if (backgroundFit === 'contain') {
          const scale = Math.min(scaleX, scaleY);
          img.scale(scale);
          img.left = (canvasWidth - imgW * scale) / 2;
          img.top = (canvasHeight - imgH * scale) / 2;
        } else if (backgroundFit === 'cover') {
          const scale = Math.max(scaleX, scaleY);
          img.scale(scale);
          img.left = (canvasWidth - imgW * scale) / 2;
          img.top = (canvasHeight - imgH * scale) / 2;
        } else {
          img.scaleX = scaleX;
          img.scaleY = scaleY;
          img.left = 0;
          img.top = 0;
        }

        canvas.backgroundImage = img;
        canvas.renderAll();
      });
    } else {
      canvas.backgroundImage = null;
      canvas.backgroundColor = "#1a1a24";
      canvas.renderAll();
    }
  }, [backgroundImage, backgroundFit]);

  // Sync layers
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const currentLayerIds = new Set(layers.map(l => l.id));
    
    // Remove deleted layers
    objectsRef.current.forEach((obj, id) => {
      if (!currentLayerIds.has(id)) {
        canvas.remove(obj);
        objectsRef.current.delete(id);
      }
    });

    // Add or update layers
    layers.forEach(layer => {
      let obj = objectsRef.current.get(layer.id);

      if (!obj) {
        // Create new object based on type
        if (layer.type === 'text') {
          obj = createTextObject(layer as TextLayer);
        } else if (layer.type === 'shape') {
          obj = createShapeObject(layer as ShapeLayer);
        } else if (layer.type === 'image') {
          // Image loading is async, handle separately
          createImageObject(layer as ImageLayer, canvas);
          return;
        }

        if (obj) {
          (obj as ExtendedFabricObject).layerId = layer.id;
          canvas.add(obj);
          objectsRef.current.set(layer.id, obj as ExtendedFabricObject);
        }
      } else {
        // Update existing object
        updateObject(obj, layer);
      }

      if (obj) {
        applyCommonProperties(obj, layer);
        if (layer.id === selectedLayerId) {
          canvas.setActiveObject(obj);
        }
      }
    });

    canvas.renderAll();
  }, [layers, selectedLayerId]);

  // Handle zoom
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    canvas.setZoom(zoom);
    canvas.renderAll();
  }, [zoom]);

  // Handle tool modes
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = activeTool === 'draw';
    canvas.selection = activeTool !== 'hand' && activeTool !== 'draw';

    if (activeTool === 'draw' && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = drawingColor;
      canvas.freeDrawingBrush.width = 3;
    }

    if (activeTool === 'eraser' && canvas.freeDrawingBrush) {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.color = '#1a1a24'; // Background color
      canvas.freeDrawingBrush.width = 20;
    }

    let isPanning = false;
    let lastX = 0;
    let lastY = 0;

    const onMouseDown = (opt: any) => {
      if (activeTool !== 'hand') return;
      isPanning = true;
      const e = opt.e as MouseEvent;
      lastX = e.clientX;
      lastY = e.clientY;
      canvas.setCursor('grabbing');
    };

    const onMouseMove = (opt: any) => {
      if (!isPanning || activeTool !== 'hand') return;
      const e = opt.e as MouseEvent;
      const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
      vpt[4] += e.clientX - lastX;
      vpt[5] += e.clientY - lastY;
      canvas.setViewportTransform(vpt as any);
      lastX = e.clientX;
      lastY = e.clientY;
    };

    const onMouseUp = () => {
      if (!isPanning) return;
      isPanning = false;
      canvas.setCursor('default');
    };

    canvas.on('mouse:down', onMouseDown);
    canvas.on('mouse:move', onMouseMove);
    canvas.on('mouse:up', onMouseUp);

    return () => {
      canvas.off('mouse:down', onMouseDown);
      canvas.off('mouse:move', onMouseMove);
      canvas.off('mouse:up', onMouseUp);
    };
  }, [activeTool, drawingColor]);
};

// Helper functions
function createTextObject(layer: TextLayer): IText {
  return new IText(layer.text || "", {
    left: layer.x,
    top: layer.y,
    fontSize: layer.fontSize,
    fontFamily: layer.fontFamily,
    fontWeight: layer.fontWeight,
    fill: layer.color,
    opacity: layer.opacity,
    angle: layer.rotation,
    textAlign: layer.textAlign as any,
    charSpacing: Math.round(layer.letterSpacing * 10),
    lineHeight: layer.lineHeight,
    scaleX: layer.scaleX ?? 1,
    scaleY: layer.scaleY ?? 1,
  });
}

function createShapeObject(layer: ShapeLayer): Rect | FabricCircle {
  const commonProps = {
    left: layer.x,
    top: layer.y,
    fill: layer.fill,
    opacity: layer.opacity,
    angle: layer.rotation,
    scaleX: layer.scaleX ?? 1,
    scaleY: layer.scaleY ?? 1,
  };

  if (layer.shapeType === 'circle') {
    return new FabricCircle({
      ...commonProps,
      radius: layer.width / 2,
    });
  } else {
    return new Rect({
      ...commonProps,
      width: layer.width,
      height: layer.height,
    });
  }
}

function createImageObject(layer: ImageLayer, canvas: FabricCanvas) {
  FabricImage.fromURL(layer.imageUrl).then((img) => {
    img.set({
      left: layer.x,
      top: layer.y,
      scaleX: (layer.scaleX ?? 1) * (layer.width / (img.width || 1)),
      scaleY: (layer.scaleY ?? 1) * (layer.height / (img.height || 1)),
      opacity: layer.opacity,
      angle: layer.rotation,
    });
    (img as ExtendedFabricObject).layerId = layer.id;
    canvas.add(img);
    canvas.renderAll();
  });
  return null;
}

function updateObject(obj: FabricObject, layer: Layer) {
  if (layer.type === 'text' && obj instanceof IText) {
    const textLayer = layer as TextLayer;
    obj.set({
      text: textLayer.text,
      fontSize: textLayer.fontSize,
      fontFamily: textLayer.fontFamily,
      fontWeight: textLayer.fontWeight,
      fill: textLayer.color,
      textAlign: textLayer.textAlign as any,
      charSpacing: Math.round(textLayer.letterSpacing * 10),
      lineHeight: textLayer.lineHeight,
    });
  } else if (layer.type === 'shape') {
    const shapeLayer = layer as ShapeLayer;
    obj.set({ fill: shapeLayer.fill });
    if (obj instanceof Rect) {
      obj.set({ width: shapeLayer.width, height: shapeLayer.height });
    } else if (obj instanceof FabricCircle) {
      obj.set({ radius: shapeLayer.width / 2 });
    }
  }

  obj.set({
    left: layer.x,
    top: layer.y,
    opacity: layer.opacity,
    angle: layer.rotation,
    scaleX: layer.scaleX ?? 1,
    scaleY: layer.scaleY ?? 1,
  });
}

function applyCommonProperties(obj: FabricObject, layer: Layer) {
  obj.visible = !layer.hidden;
  obj.selectable = !layer.locked;
  obj.evented = !layer.locked;
  obj.lockMovementX = !!layer.locked;
  obj.lockMovementY = !!layer.locked;
  obj.hasControls = !layer.locked;

  obj.setControlsVisibility({
    mt: !layer.locked,
    mb: !layer.locked,
    ml: !layer.locked,
    mr: !layer.locked,
    tl: !layer.locked,
    tr: !layer.locked,
    bl: !layer.locked,
    br: !layer.locked,
    mtr: !layer.locked,
  });

  (obj as any).globalCompositeOperation = layer.blendMode || "source-over";

  // Apply shadow
  if (layer.shadow.enabled) {
    obj.set({
      shadow: {
        color: layer.shadow.color,
        blur: layer.shadow.blur,
        offsetX: layer.shadow.offsetX,
        offsetY: layer.shadow.offsetY,
      },
    });
  } else {
    obj.set({ shadow: null });
  }

  // Apply stroke
  if (layer.stroke.enabled) {
    obj.set({
      stroke: layer.stroke.color,
      strokeWidth: layer.stroke.width,
    });
  } else {
    obj.set({
      stroke: undefined,
      strokeWidth: 0,
    });
  }
}
