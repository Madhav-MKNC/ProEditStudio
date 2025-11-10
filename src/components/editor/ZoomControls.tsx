import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
}

export const ZoomControls = ({ zoom, onZoomIn, onZoomOut, onZoomReset }: ZoomControlsProps) => {
  return (
    <div className="flex items-center gap-2 bg-editor-panel-glass backdrop-blur-sm border border-border rounded-lg px-3 py-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onZoomOut}
        className="h-7 w-7"
      >
        <ZoomOut className="w-4 h-4" />
      </Button>
      <button
        onClick={onZoomReset}
        className="text-sm font-medium min-w-[60px] hover:text-primary transition-colors"
      >
        {Math.round(zoom * 100)}%
      </button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onZoomIn}
        className="h-7 w-7"
      >
        <ZoomIn className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onZoomReset}
        className="h-7 w-7"
      >
        <Maximize2 className="w-4 h-4" />
      </Button>
    </div>
  );
};
