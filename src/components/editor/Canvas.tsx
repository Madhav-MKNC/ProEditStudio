import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, IText, Image as FabricImage, FabricObject } from "fabric";
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
        onUpdateLayer(obj.layerId, {
          x: obj.left || 0,
          y: obj.top || 0,
          rotation: obj.angle || 0,
          text: obj.text || "",
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
        const canvasWidth = canvas.width || 1200;
        const canvasHeight = canvas.height || 800;
        
        img.scaleToWidth(canvasWidth);
        img.scaleToHeight(canvasHeight);
        
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
          fill: layer.gradient.enabled 
            ? `linear-gradient(${layer.gradient.angle}deg, ${layer.gradient.colors.join(', ')})`
            : layer.color,
          opacity: layer.opacity,
          angle: layer.rotation,
          textAlign: layer.textAlign,
          charSpacing: layer.letterSpacing * 10,
          lineHeight: layer.lineHeight,
        }) as ExtendedIText;

        textObj.layerId = layer.id;
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
          fill: layer.gradient.enabled
            ? `linear-gradient(${layer.gradient.angle}deg, ${layer.gradient.colors.join(', ')})`
            : layer.color,
          opacity: layer.opacity,
          angle: layer.rotation,
          textAlign: layer.textAlign,
          charSpacing: layer.letterSpacing * 10,
          lineHeight: layer.lineHeight,
        });

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
