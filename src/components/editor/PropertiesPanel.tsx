import { TextLayer } from "@/types/editor";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PropertiesPanelProps {
  selectedLayer: TextLayer | null;
  onUpdateLayer: (id: string, updates: Partial<TextLayer>) => void;
}

const fonts = [
  "Inter", "Roboto", "Open Sans", "Montserrat", "Playfair Display", 
  "Bebas Neue", "Oswald", "Poppins", "Raleway", "Lato"
];

export const PropertiesPanel = ({ selectedLayer, onUpdateLayer }: PropertiesPanelProps) => {
  if (!selectedLayer) {
    return (
      <div className="rounded-lg bg-editor-panel-glass backdrop-blur-sm border border-border p-6">
        <p className="text-sm text-muted-foreground text-center">
          Select a layer to edit properties
        </p>
      </div>
    );
  }

  const update = (updates: Partial<TextLayer>) => {
    onUpdateLayer(selectedLayer.id, updates);
  };

  return (
    <ScrollArea className="h-full">
      <div className="rounded-lg bg-editor-panel-glass backdrop-blur-sm border border-border p-4 space-y-4">
        <h3 className="font-semibold text-lg">Properties</h3>

        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Text</Label>
            <Input
              value={selectedLayer.text}
              onChange={(e) => update({ text: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Font Family</Label>
            <Select value={selectedLayer.fontFamily} onValueChange={(value) => update({ fontFamily: value })}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fonts.map(font => (
                  <SelectItem key={font} value={font}>{font}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Font Size: {selectedLayer.fontSize}px</Label>
            <Slider
              value={[selectedLayer.fontSize]}
              onValueChange={([value]) => update({ fontSize: value })}
              min={12}
              max={200}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Color</Label>
            <Input
              type="color"
              value={selectedLayer.color}
              onChange={(e) => update({ color: e.target.value })}
              className="mt-1 h-10"
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Opacity: {Math.round(selectedLayer.opacity * 100)}%</Label>
            <Slider
              value={[selectedLayer.opacity]}
              onValueChange={([value]) => update({ opacity: value })}
              min={0}
              max={1}
              step={0.01}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Rotation: {selectedLayer.rotation}°</Label>
            <Slider
              value={[selectedLayer.rotation]}
              onValueChange={([value]) => update({ rotation: value })}
              min={-180}
              max={180}
              step={1}
              className="mt-2"
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Enable Shadow</Label>
            <Switch
              checked={selectedLayer.shadow.enabled}
              onCheckedChange={(checked) => update({ 
                shadow: { ...selectedLayer.shadow, enabled: checked }
              })}
            />
          </div>

          {selectedLayer.shadow.enabled && (
            <div className="space-y-3 pl-4 border-l-2 border-primary/20">
              <div>
                <Label className="text-xs text-muted-foreground">Shadow Color</Label>
                <Input
                  type="color"
                  value={selectedLayer.shadow.color}
                  onChange={(e) => update({ 
                    shadow: { ...selectedLayer.shadow, color: e.target.value }
                  })}
                  className="mt-1 h-8"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Blur: {selectedLayer.shadow.blur}px</Label>
                <Slider
                  value={[selectedLayer.shadow.blur]}
                  onValueChange={([value]) => update({ 
                    shadow: { ...selectedLayer.shadow, blur: value }
                  })}
                  min={0}
                  max={50}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Enable Stroke</Label>
            <Switch
              checked={selectedLayer.stroke.enabled}
              onCheckedChange={(checked) => update({ 
                stroke: { ...selectedLayer.stroke, enabled: checked }
              })}
            />
          </div>

          {selectedLayer.stroke.enabled && (
            <div className="space-y-3 pl-4 border-l-2 border-accent/20">
              <div>
                <Label className="text-xs text-muted-foreground">Stroke Color</Label>
                <Input
                  type="color"
                  value={selectedLayer.stroke.color}
                  onChange={(e) => update({ 
                    stroke: { ...selectedLayer.stroke, color: e.target.value }
                  })}
                  className="mt-1 h-8"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Width: {selectedLayer.stroke.width}px</Label>
                <Slider
                  value={[selectedLayer.stroke.width]}
                  onValueChange={([value]) => update({ 
                    stroke: { ...selectedLayer.stroke, width: value }
                  })}
                  min={1}
                  max={20}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Enable Gradient</Label>
            <Switch
              checked={selectedLayer.gradient.enabled}
              onCheckedChange={(checked) => update({ 
                gradient: { ...selectedLayer.gradient, enabled: checked }
              })}
            />
          </div>

          {selectedLayer.gradient.enabled && (
            <div className="space-y-3 pl-4 border-l-2 border-accent/20">
              <div>
                <Label className="text-xs text-muted-foreground">Start Color</Label>
                <Input
                  type="color"
                  value={selectedLayer.gradient.colors[0]}
                  onChange={(e) => {
                    const colors = [...selectedLayer.gradient.colors];
                    colors[0] = e.target.value;
                    update({ gradient: { ...selectedLayer.gradient, colors }});
                  }}
                  className="mt-1 h-8"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">End Color</Label>
                <Input
                  type="color"
                  value={selectedLayer.gradient.colors[1]}
                  onChange={(e) => {
                    const colors = [...selectedLayer.gradient.colors];
                    colors[1] = e.target.value;
                    update({ gradient: { ...selectedLayer.gradient, colors }});
                  }}
                  className="mt-1 h-8"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Angle: {selectedLayer.gradient.angle}°</Label>
                <Slider
                  value={[selectedLayer.gradient.angle]}
                  onValueChange={([value]) => update({ 
                    gradient: { ...selectedLayer.gradient, angle: value }
                  })}
                  min={0}
                  max={360}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
};
