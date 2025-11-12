import { useState } from "react";
import { TextLayer } from "@/types/editor";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input"; // Assuming you have an Input component
import { Trash2, Copy, Type, Eye, EyeOff, Lock, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayersPanelProps {
  layers: TextLayer[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string) => void;
  onDeleteLayer: (id: string) => void;
  onDuplicateLayer: (id: string) => void;
  onToggleLock: (id: string) => void;
  onToggleHide: (id: string) => void;
  onRenameLayer: (id: string, name: string) => void;
}

export const LayersPanel = ({
  layers,
  selectedLayerId,
  onSelectLayer,
  onDeleteLayer,
  onDuplicateLayer,
  onToggleLock,
  onToggleHide,
  onRenameLayer,
}: LayersPanelProps) => {
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingLayerName, setEditingLayerName] = useState<string>('');

  const handleStartRename = (layer: TextLayer) => {
    setEditingLayerId(layer.id);
    setEditingLayerName(layer.name || layer.text);
  };

  const handleRenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingLayerName(e.target.value);
  };

  const handleRenameSubmit = (id: string) => {
    if (editingLayerName.trim() !== '') {
      onRenameLayer(id, editingLayerName.trim());
    }
    setEditingLayerId(null);
    setEditingLayerName('');
  };

  const handleRenameBlur = (id: string) => {
    handleRenameSubmit(id);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: string) => {
    if (e.key === 'Enter') {
      handleRenameSubmit(id);
    }
    if (e.key === 'Escape') {
      setEditingLayerId(null);
      setEditingLayerName('');
    }
  };

  return (
    <div className="rounded-lg bg-editor-panel-glass backdrop-blur-sm border border-border p-3">
      <div className="flex items-center gap-2 mb-3">
        <Type className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm">Layers</h3>
      </div>

      <ScrollArea className="h-[250px]">
        <div className="space-y-1">
          {layers.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">
              No layers yet. Add text to get started!
            </p>
          ) : (
            layers.map((layer) => (
              <div
                key={layer.id}
                onClick={() => onSelectLayer(layer.id)}
                onDoubleClick={() => handleStartRename(layer)}
                className={cn(
                  "p-2 rounded border cursor-pointer transition-all group",
                  "hover:bg-muted/50",
                  selectedLayerId === layer.id
                    ? "bg-primary/10 border-primary"
                    : "bg-editor-panel/50 border-border"
                )}
              >
                <div className="flex items-center justify-between">
                  {editingLayerId === layer.id ? (
                    <Input
                      value={editingLayerName}
                      onChange={handleRenameChange}
                      onBlur={() => handleRenameBlur(layer.id)}
                      onKeyDown={(e) => handleRenameKeyDown(e, layer.id)}
                      autoFocus
                      className="h-7 text-xs flex-1 mr-2"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                      <Type className="w-3 h-3 text-primary flex-shrink-0" />
                      <span className="text-xs truncate" title={layer.name || layer.text}>
                        {layer.name || layer.text}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleHide(layer.id);
                      }}
                    >
                      {layer.hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleLock(layer.id);
                      }}
                    >
                      {layer.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateLayer(layer.id);
                      }}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-destructive/20 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteLayer(layer.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
