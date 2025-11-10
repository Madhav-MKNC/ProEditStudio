import { Button } from "@/components/ui/button";
import { Undo2, Redo2 } from "lucide-react";

interface HistoryControlsProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const HistoryControls = ({ onUndo, onRedo, canUndo, canRedo }: HistoryControlsProps) => {
  return (
    <div className="flex items-center gap-1 bg-editor-panel-glass backdrop-blur-sm border border-border rounded-lg p-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={onUndo}
        disabled={!canUndo}
        className="h-8 w-8"
      >
        <Undo2 className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onRedo}
        disabled={!canRedo}
        className="h-8 w-8"
      >
        <Redo2 className="w-4 h-4" />
      </Button>
    </div>
  );
};
