import { useRef } from "react";
import { Canvas as FabricCanvas } from "fabric";
import { Layer, createDefaultImage } from "@/types/editor";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { useCanvasRenderer } from "./CanvasRenderer";

interface CanvasProps {
  layers: Layer[];
  selectedLayerId: string | null;
  backgroundImage: string | null;
  onSelectLayer: (id: string | null) => void;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  onAddLayer: (layer: Layer) => void;
  onBackgroundImageChange: (url: string | null) => void;
  zoom: number;
  backgroundFit: 'contain' | 'cover' | 'stretch';
  activeTool: string;
  drawingColor: string;
  imageInputRef: React.RefObject<HTMLInputElement>;
}

export const Canvas = ({
  layers,
  selectedLayerId,
  backgroundImage,
  onSelectLayer,
  onUpdateLayer,
  onAddLayer,
  onBackgroundImageChange,
  zoom,
  backgroundFit,
  activeTool,
  drawingColor,
  imageInputRef,
}: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use canvas renderer hook
  useCanvasRenderer({
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
  });

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleImageLayerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const layer = createDefaultImage(`layer-${Date.now()}`, url, img.width, img.height);
          onAddLayer(layer);
          toast.success("Image added to canvas!");
        };
        img.src = url;
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
              onChange={handleBackgroundUpload}
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
      
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageLayerUpload}
        className="hidden"
      />
    </div>
  );
};
