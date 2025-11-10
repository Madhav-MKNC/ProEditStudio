import { Type, Image, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createDefaultLayer, TextLayer } from "@/types/editor";
import { toast } from "sonner";

interface ToolbarProps {
  onAddText: (layer: TextLayer) => void;
}

export const Toolbar = ({ onAddText }: ToolbarProps) => {
  const handleAddText = () => {
    const newLayer = createDefaultLayer(`layer-${Date.now()}`);
    onAddText(newLayer);
    toast.success("Text layer added!");
  };

  return (
    <div className="w-20 bg-editor-panel border-r border-border flex flex-col items-center gap-4 py-6">
      <Button
        variant="ghost"
        size="icon"
        className="w-12 h-12 hover:bg-primary/20 hover:text-primary transition-colors"
        onClick={handleAddText}
        title="Add Text Layer"
      >
        <Type className="w-6 h-6" />
      </Button>
    </div>
  );
};
