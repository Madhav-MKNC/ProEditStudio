import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, IText, Image as FabricImage, FabricObject, Gradient } from "fabric";
import { TextLayer } from "@/types/editor";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";

// Extend IText to include custom data
interface ExtendedIText extends IText {
  layerId?: string;
}

interface CanvasProps {
  layers: TextLayer[];
  selectedLayerId: string | null;
  backgroundImage: string | null;
  onSelectLayer: (id: string | null) => void;
  onUpdateLayer: (id: string, updates: Partial<TextLayer>) => void;
  onBackgroundImageChange: (url: string | null) => void;
  zoom: number; // Added
  backgroundFit: 'contain' | 'cover' | 'stretch'; // Added
  activeTool: string;
}

export const Canvas = ({
  layers,
  selectedLayerId,
  backgroundImage,
  onSelectLayer,
  onUpdateLayer,
  onBackgroundImageChange,
  zoom, // Added
  backgroundFit, // Added
  activeTool,
}: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const textObjectsRef = useRef<Map<string, ExtendedIText>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helpers
  const makeGradientFill = (obj: IText, layer: TextLayer) => {
    const gradient = (layer as any).gradient;
    if (!gradient?.enabled) return layer.color;
    try {
      const w = obj.width || 200;
      const h = obj.height || 60;
      const colors = (gradient.colors && gradient.colors.length ? gradient.colors : [layer.color, layer.color]) as string[];
      const type = gradient.type || "linear";
      if (type === "radial") {
        return new Gradient({
          type: "radial",
          coords: { x1: w / 2, y1: h / 2, r1: 0, x2: w / 2, y2: h / 2, r2: Math.max(w, h) / 2 },
          colorStops: [
            { offset: 0, color: colors[0] },
            { offset: 1, color: colors[1] || colors[0] },
          ],
        });
      }
      // linear (approximate along X)
      return new Gradient({
        type: "linear",
        coords: { x1: 0, y1: 0, x2: w, y2: 0 },
        colorStops: [
          { offset: 0, color: colors[0] },
          { offset: 1, color: colors[1] || colors[0] },
        ],
      });
    } catch {
      return layer.color;
    }
  };

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 1200,
      height: 800,
      backgroundColor: "#1a1a24",
    });

    canvas.preserveObjectStacking = true;
    try {
      canvas.freeDrawingBrush.color = '#ffffff';
      canvas.freeDrawingBrush.width = 2;
    } catch {}

    fabricCanvasRef.current = canvas;

    // Handle selection
    canvas.on("selection:created", (e) => {
      const obj = e.selected?.[0] as ExtendedIText;
      if (obj && obj.layerId) {
        onSelectLayer(obj.layerId);
      }
    });

    canvas.on("selection:updated", (e) => {
      const obj = e.selected?.[0] as ExtendedIText;
      if (obj && obj.layerId) {
        onSelectLayer(obj.layerId);
      }
    });

    canvas.on("selection:cleared", () => {
      onSelectLayer(null);
    });

    // Handle object modifications
    canvas.on("object:modified", (e) => {
      const obj = e.target as ExtendedIText;
      if (obj && obj.layerId) {
        // Normalize scaling into fontSize to keep state in sync
        const scaleX = obj.scaleX ?? 1;
        const scaleY = obj.scaleY ?? 1;
        let newFontSize = obj.fontSize ?? 0;
        if (scaleX !== 1 || scaleY !== 1) {
          const factor = (scaleX + scaleY) / 2; // average to keep proportion for IText
          newFontSize = Math.max(1, Math.round((obj.fontSize ?? 0) * factor));
          obj.set({ scaleX: 1, scaleY: 1, fontSize: newFontSize });
        }
        obj.setCoords();
        canvas.requestRenderAll();
        onUpdateLayer(obj.layerId, {
          x: obj.left || 0,
          y: obj.top || 0,
          rotation: obj.angle || 0,
          text: obj.text || "",
          fontSize: newFontSize || undefined,
        });
      }
    });

    // Handle text editing
    canvas.on("text:changed", (e) => {
      const obj = e.target as ExtendedIText;
      if (obj && obj.layerId) {
        onUpdateLayer(obj.layerId, {
          text: obj.text || "",
        });
      }
    });

    return () => {
      canvas.dispose();
    };
  }, []);

  // Update background image
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    if (backgroundImage) {
      FabricImage.fromURL(backgroundImage).then((img) => {
        const canvasWidth = (canvas.width || 1200);
        const canvasHeight = (canvas.height || 800);
        const imgW = img.width || canvasWidth;
        const imgH = img.height || canvasHeight;

        let scaleX = canvasWidth / imgW;
        let scaleY = canvasHeight / imgH;
        let scale = 1;

        if (backgroundFit === 'contain') {
          scale = Math.min(scaleX, scaleY);
        } else if (backgroundFit === 'cover') {
          scale = Math.max(scaleX, scaleY);
        } else if (backgroundFit === 'stretch') {
          img.scaleX = scaleX;
          img.scaleY = scaleY;
          img.left = 0;
          img.top = 0;
          canvas.backgroundImage = img;
          canvas.renderAll();
          return;
        }

        img.scale(scale);
        img.left = (canvasWidth - (imgW * scale)) / 2;
        img.top = (canvasHeight - (imgH * scale)) / 2;
        canvas.backgroundImage = img;
        canvas.renderAll();
      });
    } else {
      canvas.backgroundColor = "#1a1a24";
      canvas.renderAll();
    }
  }, [backgroundImage, backgroundFit]);

  // Sync layers with fabric objects
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Remove deleted layers
    const currentLayerIds = new Set(layers.map(l => l.id));
    textObjectsRef.current.forEach((obj, id) => {
      if (!currentLayerIds.has(id)) {
        canvas.remove(obj);
        textObjectsRef.current.delete(id);
      }
    });

    // Add or update layers
    layers.forEach(layer => {
      let textObj = textObjectsRef.current.get(layer.id);

      if (!textObj) {
        // Create new text object
        textObj = new IText(layer.text ?? "", {
          left: layer.x ?? 0,
          top: layer.y ?? 0,
          fontSize: layer.fontSize ?? 16,
          fontFamily: layer.fontFamily ?? "Inter",
          fontWeight: layer.fontWeight ?? "normal",
          fill: layer.color ?? "#ffffff", // temporary, will set gradient below if enabled
          opacity: layer.opacity ?? 1,
          angle: layer.rotation ?? 0,
          textAlign: (layer.textAlign as any) ?? "left",
          charSpacing: Math.round(((layer.letterSpacing ?? 0) as number) * 10),
          lineHeight: layer.lineHeight ?? 1.2,
        }) as ExtendedIText;

        textObj.layerId = layer.id;
        canvas.add(textObj);
        textObjectsRef.current.set(layer.id, textObj);
      }

      // Update existing text object or newly created one
      textObj.set({
        text: layer.text ?? "",
        left: layer.x ?? 0,
        top: layer.y ?? 0,
        fontSize: layer.fontSize ?? textObj.fontSize ?? 16,
        fontFamily: layer.fontFamily ?? (textObj.fontFamily as string) ?? "Inter",
        fontWeight: layer.fontWeight ?? (textObj.fontWeight as string) ?? "normal",
        opacity: layer.opacity ?? 1,
        angle: layer.rotation ?? 0,
        textAlign: (layer.textAlign as any) ?? "left",
        charSpacing: Math.round(((layer.letterSpacing ?? 0) as number) * 10),
        lineHeight: layer.lineHeight ?? 1.2,
      });

      // Update dynamic props that need object context
      const fill = makeGradientFill(textObj, layer);
      textObj.set({ fill });

      // Handle visibility and locking
      textObj.visible = !(layer.hidden ?? false);
      textObj.selectable = !(layer.locked ?? false);
      textObj.evented = !(layer.locked ?? false);
      textObj.lockMovementX = !!layer.locked;
      textObj.lockMovementY = !!layer.locked;
      textObj.hasControls = !(layer.locked ?? false);

      (textObj as any).globalCompositeOperation = layer.blendMode || "source-over";


      // Apply shadow
      if (layer.shadow.enabled) {
        textObj.set({
          shadow: {
            color: layer.shadow.color,
            blur: layer.shadow.blur,
            offsetX: layer.shadow.offsetX,
            offsetY: layer.shadow.offsetY,
          },
        });
      } else {
        textObj.set({ shadow: null });
      }

      // Apply stroke
      if (layer.stroke.enabled) {
        textObj.set({
          stroke: layer.stroke.color,
          strokeWidth: layer.stroke.width,
        });
      } else {
        textObj.set({
          stroke: undefined,
          strokeWidth: 0,
        });
      }

      // Set selection
      if (layer.id === selectedLayerId) {
        canvas.setActiveObject(textObj);
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

  // Tool modes: draw and hand (pan)
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = activeTool === 'draw';
    canvas.selection = activeTool !== 'hand' && activeTool !== 'draw';

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
  }, [activeTool]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        onBackgroundImageChange(url);
        toast.success("Background image uploaded!");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative">
      <div className="relative rounded-lg overflow-hidden shadow-panel border border-border"
        style={{
          width: 1200 * zoom,
          height: 800 * zoom,
          transformOrigin: 'top left',
        }}
      >
        <canvas ref={canvasRef} />
      </div>

      {!backgroundImage && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="backdrop-blur-sm bg-editor-panel/50"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Background Image
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
