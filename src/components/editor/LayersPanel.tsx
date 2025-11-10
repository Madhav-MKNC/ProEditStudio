import { TextLayer } from "@/types/editor";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Copy, Type } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayersPanelProps {
  layers: TextLayer[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string) => void;
  onDeleteLayer: (id: string) => void;
  onDuplicateLayer: (id: string) => void;
}

export const LayersPanel = ({
  layers,
  selectedLayerId,
  onSelectLayer,
  onDeleteLayer,
  onDuplicateLayer,
}: LayersPanelProps) => {
  return (
    <div className="rounded-lg bg-editor-panel-glass backdrop-blur-sm border border-border p-4">
      <h3 className="font-semibold text-lg mb-4">Layers</h3>
      
      <ScrollArea className="h-[300px]">
        <div className="space-y-2">
          {layers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No layers yet. Add text to get started!
            </p>
          ) : (
            layers.map((layer) => (
              <div
                key={layer.id}
                onClick={() => onSelectLayer(layer.id)}
                className={cn(
                  "p-3 rounded-md border cursor-pointer transition-all",
                  "hover:bg-muted/50",
                  selectedLayerId === layer.id
                    ? "bg-primary/10 border-primary"
                    : "bg-editor-panel border-border"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Type className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm truncate">{layer.text}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
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
                      className="h-7 w-7 hover:bg-destructive/20 hover:text-destructive"
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
