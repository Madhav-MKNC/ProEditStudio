import { TextLayer } from "@/types/editor";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Type, Palette, Sparkles, Layers3 } from "lucide-react";

interface PropertiesPanelProps {
  selectedLayer: TextLayer | null;
  onUpdateLayer: (id: string, updates: Partial<TextLayer>) => void;
}

// --- IMPORTANT: DEFINE YOUR AVAILABLE FONTS HERE ---
// This array should contain the 'font-family' names
// that you've defined using @font-face rules in src/styles/fonts.css.
// Ensure these names exactly match what you put in fonts.css
// for self-hosted fonts to work.
const availableFonts = [
  "Arial",
  "Verdana",
  "Times New Roman",
  "Courier New",
  'Autoradiographic Italic',
  'Autoradiographic',
  'Axaxax',
  'Bench Grinder Titling',
  'Bitcrusher Condensed',
  'Breamcatcher',
  'Budmo Jiggler',
  'Budmo Jigglish',
  'Built Titling', // This family has multiple weights/styles
  'Bullpen 3D',
  'Bullpen', // This family has multiple weights/styles
  'Carbon', // This family has multiple weights/styles
  'Carbon Phyber',
  'Cardigan Titling', // This family has multiple weights/styles
  'Chickweed Titling',
  'Chinese Rocks',
  'Conthrax', // This family has multiple weights/styles
  'Coolvetica', // This family has multiple weights/styles
  'Dealerplate California',
  'Densmore',
  'Dirty Bakers Dozen',
  'Dream Orphanage',
  'Duality',
  'Earwig Factory',
  'Ethnocentric', // This family has multiple weights/styles
  'Evensong Hollow',
  'Expressway',
  'Fenwick Outline',
  'Fledgling',
  'Forgotten Futurist', // This family has multiple weights/styles
  'Galderglynn Titling', // This family has multiple weights/styles
  'Geoparody', // This family has multiple weights/styles
  'Gnuolane',
  'Good Times',
  'Good Timing',
  'Gravtrac',
  'Gunplay 3D',
  'Gunplay',
  'Gymkhana',
  'Heavy Heap',
  'Hemi Head',
  'Jesaya',
  'Joystix Monospace',
  'Junegull',
  'Kenyan Coffee', // This family has multiple weights/styles
  'Kenyan Coffee Stencil',
  'Kimberley',
  'Kingsbridge', // This family has multiple weights/styles
  'Kingsbridge Condensed', // This family has multiple weights/styles
  'Kingsbridge Extended', // This family has multiple weights/styles
  'Kingsbridge SmallCaps', // This family has multiple weights/styles
  'Kirsty', // This family has multiple weights/styles
  'Kleptocracy Titling', // This family has multiple weights/styles
  'Kleptocracy Titling Condensed',
  'Kleptocracy Titling Extended',
  'Larabiefont',
  'Libel Suit',
  'Meloche',
  'Mexcellent 3D',
  'Mexcellent',
  'Mixolydian Titling', // This family has multiple weights/styles
  'Monofonto',
  'Mufferaw',
  'Nasalization',
  'Negotiate',
  'Neuropol X',
  'Neuropolitical',
  'Nulshock',
  'Octin College',
  'Octin Prison',
  'Octin Sports',
  'Octin Spraypaint A',
  'Octin Stencil',
  'Octin Vintage B',
  'Pakenham',
  'Palamecia Titling',
  'Pirulen',
  'Pricedown',
  'ProtoMono', // Explicitly listed since it's a woff/woff2
  'Pupcat',
  'Quasix Titling',
  'Rakesly', // This family has multiple weights/styles
  'Recharge',
  'Remissis',
  'Rexlia',
  'Rimouski',
  'Shlop',
  'Sofachrome', // This family has multiple weights/styles
  'Steelfish', // This family has multiple weights/styles
  'Steelfish Outline',
  'Steelfish Rounded',
  'Strenuous 3D',
  'Strenuous', // This family has multiple weights/styles
  'Sui Generis',
  'Toxigenesis',
  'Venus Rising',
  'Vinque',
  'Vipnagorgialla', // This family has multiple weights/styles
  'Wheaton Capitals',
  'Zekton',
  'Zrnic',
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
      <div className="rounded-lg bg-editor-panel-glass backdrop-blur-sm border border-border p-3 space-y-3">
        <div className="flex items-center gap-2 pb-2">
          <Type className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Properties</h3>
        </div>

        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-8">
            <TabsTrigger value="text" className="text-xs">
              <Type className="w-3 h-3" />
            </TabsTrigger>
            <TabsTrigger value="style" className="text-xs">
              <Palette className="w-3 h-3" />
            </TabsTrigger>
            <TabsTrigger value="effects" className="text-xs">
              <Sparkles className="w-3 h-3" />
            </TabsTrigger>
            <TabsTrigger value="transform" className="text-xs">
              <Layers3 className="w-3 h-3" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-3 mt-3">
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Text Content</Label>
                <Input
                  value={selectedLayer.text}
                  onChange={(e) => update({ text: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Font Family</Label>
                <Select value={selectedLayer.fontFamily} onValueChange={(value) => update({ fontFamily: value })}>
                  <SelectTrigger className="mt-1 h-8 text-xs">
                    <SelectValue placeholder="Select a font" /> {/* Added placeholder */}
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-[200px]"> {/* Added ScrollArea for potentially long font list */}
                      {availableFonts.map(font => (
                        // Apply the font-family style directly to the SelectItem for visual preview
                        <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                          {font}
                        </SelectItem>
                      ))}
                    </ScrollArea>
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
                <Label className="text-xs text-muted-foreground">Letter Spacing: {selectedLayer.letterSpacing}</Label>
                <Slider
                  value={[selectedLayer.letterSpacing]}
                  onValueChange={([value]) => update({ letterSpacing: value })}
                  min={-5}
                  max={20}
                  step={0.1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Line Height: {selectedLayer.lineHeight.toFixed(1)}</Label>
                <Slider
                  value={[selectedLayer.lineHeight]}
                  onValueChange={([value]) => update({ lineHeight: value })}
                  min={0.5}
                  max={3}
                  step={0.1}
                  className="mt-2"
                />
              </div>
            </div>
          </TabsContent>

          {/* --- The rest of your TabsContent components remain completely unchanged --- */}
          <TabsContent value="style" className="space-y-3 mt-3">
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Fill Color</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="color"
                    value={selectedLayer.color}
                    onChange={(e) => update({ color: e.target.value })}
                    className="h-8 w-16"
                  />
                  <Input
                    value={selectedLayer.color}
                    onChange={(e) => update({ color: e.target.value })}
                    className="h-8 flex-1 text-xs"
                  />
                </div>
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

              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Shadow</Label>
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

              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Stroke</Label>
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

              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Gradient</Label>
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
                        update({ gradient: { ...selectedLayer.gradient, colors } });
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
                        update({ gradient: { ...selectedLayer.gradient, colors } });
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
          </TabsContent>

          <TabsContent value="effects" className="space-y-3 mt-3">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Shadow</Label>
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
                  <div>
                    <Label className="text-xs text-muted-foreground">Offset X: {selectedLayer.shadow.offsetX}px</Label>
                    <Slider
                      value={[selectedLayer.shadow.offsetX]}
                      onValueChange={([value]) => update({
                        shadow: { ...selectedLayer.shadow, offsetX: value }
                      })}
                      min={-50}
                      max={50}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Offset Y: {selectedLayer.shadow.offsetY}px</Label>
                    <Slider
                      value={[selectedLayer.shadow.offsetY]}
                      onValueChange={([value]) => update({
                        shadow: { ...selectedLayer.shadow, offsetY: value }
                      })}
                      min={-50}
                      max={50}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="transform" className="space-y-3 mt-3">
            <div className="space-y-3">
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

              <div>
                <Label className="text-xs text-muted-foreground">Position X: {Math.round(selectedLayer.x)}px</Label>
                <Slider
                  value={[selectedLayer.x]}
                  onValueChange={([value]) => update({ x: value })}
                  min={0}
                  max={1200}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Position Y: {Math.round(selectedLayer.y)}px</Label>
                <Slider
                  value={[selectedLayer.y]}
                  onValueChange={([value]) => update({ y: value })}
                  min={0}
                  max={800}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
};
