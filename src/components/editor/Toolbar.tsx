import { Button } from "@/components/ui/button";
import { Type, Square, Circle, Image, MousePointer2, Hand, Pencil, Eraser, Pipette, Sparkles, Wand2 } from "lucide-react";
import { TextLayer, createDefaultLayer } from "@/types/editor";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ToolbarProps {
  onAddText: (layer: TextLayer) => void;
  activeTool: string;
  onToolChange: (tool: string) => void;
}

export const Toolbar = ({ onAddText, activeTool, onToolChange }: ToolbarProps) => {
  const handleAddText = () => {
    const layer = createDefaultLayer(`layer-${Date.now()}`);
    onAddText(layer);
    onToolChange('select');
  };

  const tools = [
    { id: 'select', icon: MousePointer2, label: 'Select' },
    { id: 'hand', icon: Hand, label: 'Hand Tool' },
    { id: 'text', icon: Type, label: 'Text', action: handleAddText },
    { id: 'shape', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'draw', icon: Pencil, label: 'Draw' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
    { id: 'eyedropper', icon: Pipette, label: 'Eyedropper' },
    { id: 'magic', icon: Sparkles, label: 'Magic Select' },
    { id: 'effects', icon: Wand2, label: 'Effects' },
  ];

  return (
    <div className="w-16 bg-editor-panel border-r border-border flex flex-col items-center py-4 gap-1">
      {tools.map((tool, index) => (
        <div key={tool.id}>
          <Button
            variant="ghost"
            size="icon"
            onClick={tool.action || (() => onToolChange(tool.id))}
            className={cn(
              "w-12 h-12 hover:bg-primary/10 hover:text-primary transition-all",
              activeTool === tool.id && "bg-primary/20 text-primary"
            )}
            title={tool.label}
          >
            <tool.icon className="w-5 h-5" />
          </Button>
          {[2, 7].includes(index) && <Separator className="my-2" />}
        </div>
      ))}
    </div>
  );
};
