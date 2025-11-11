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
}

export const Canvas = ({
  layers,
  selectedLayerId,
  backgroundImage,
  onSelectLayer,
  onUpdateLayer,
  onBackgroundImageChange,
}: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const textObjectsRef = useRef<Map<string, ExtendedIText>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helpers
  const makeGradientFill = (obj: IText, layer: TextLayer) => {
    if (!layer.gradient.enabled) return layer.color;
    try {
      const w = (obj.width || 200);
      const h = (obj.height || 60);
      const type = layer.gradient.type;
      if (type === "radial") {
        return new Gradient({
          type: "radial",
          coords: { x1: w / 2, y1: h / 2, r1: 0, x2: w / 2, y2: h / 2, r2: Math.max(w, h) / 2 },
          colorStops: [
            { offset: 0, color: layer.gradient.colors[0] },
            { offset: 1, color: layer.gradient.colors[1] || layer.gradient.colors[0] },
          ],
        });
      }
      // linear (approximate along X)
      return new Gradient({
        type: "linear",
        coords: { x1: 0, y1: 0, x2: w, y2: 0 },
        colorStops: [
          { offset: 0, color: layer.gradient.colors[0] },
          { offset: 1, color: layer.gradient.colors[1] || layer.gradient.colors[0] },
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
        let newFontSize = obj.fontSize || 0;
        if (scaleX !== 1 || scaleY !== 1) {
          const factor = (scaleX + scaleY) / 2; // average to keep proportion for IText
          newFontSize = Math.max(1, Math.round((obj.fontSize || 0) * factor));
          obj.set({ scaleX: 1, scaleY: 1, fontSize: newFontSize });
        }
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
        const scale = Math.min(canvasWidth / imgW, canvasHeight / imgH); // contain
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
  }, [backgroundImage]);

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
        textObj = new IText(layer.text, {
          left: layer.x,
          top: layer.y,
          fontSize: layer.fontSize,
          fontFamily: layer.fontFamily,
          fontWeight: layer.fontWeight,
          fill: layer.color, // temporary, will set gradient below if enabled
          opacity: layer.opacity,
          angle: layer.rotation,
          textAlign: layer.textAlign,
          charSpacing: layer.letterSpacing * 10,
          lineHeight: layer.lineHeight,
        }) as ExtendedIText;

        textObj.layerId = layer.id;
        // Apply gradient, visibility, locking, and blend mode
        const fill = makeGradientFill(textObj, layer);
        textObj.set({ fill });
        textObj.visible = !(layer.hidden ?? false);
        textObj.selectable = !(layer.locked ?? false);
        textObj.evented = !(layer.locked ?? false);
        textObj.lockMovementX = !!layer.locked;
        textObj.lockMovementY = !!layer.locked;
        textObj.hasControls = !(layer.locked ?? false);
        (textObj as any).globalCompositeOperation = layer.blendMode || "source-over";

        canvas.add(textObj);
        textObjectsRef.current.set(layer.id, textObj);
      } else {
        // Update existing text object
        textObj.set({
          text: layer.text,
          left: layer.x,
          top: layer.y,
          fontSize: layer.fontSize,
          fontFamily: layer.fontFamily,
          fontWeight: layer.fontWeight,
          opacity: layer.opacity,
          angle: layer.rotation,
          textAlign: layer.textAlign,
          charSpacing: layer.letterSpacing * 10,
          lineHeight: layer.lineHeight,
        });
        // Update dynamic props that need object context
        const fill = makeGradientFill(textObj, layer);
        textObj.set({ fill });
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
      }

      // Set selection
      if (layer.id === selectedLayerId) {
        canvas.setActiveObject(textObj);
      }
    });

    canvas.renderAll();
  }, [layers, selectedLayerId]);

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
      <div className="relative rounded-lg overflow-hidden shadow-panel border border-border">
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
