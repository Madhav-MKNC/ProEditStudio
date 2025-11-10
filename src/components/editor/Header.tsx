import { Type, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TextLayer } from "@/types/editor";

interface HeaderProps {
  layers: TextLayer[];
  backgroundImage: string | null;
}

export const Header = ({ layers, backgroundImage }: HeaderProps) => {
  const handleExport = async () => {
    try {
      const canvas = document.querySelector('canvas');
      if (!canvas) {
        toast.error("Canvas not found");
        return;
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `text-design-${Date.now()}.png`;
          a.click();
          URL.revokeObjectURL(url);
          toast.success("Image exported successfully!");
        }
      }, 'image/png');
    } catch (error) {
      toast.error("Failed to export image");
    }
  };

  return (
    <header className="h-16 bg-editor-panel border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Type className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            TextCraft Studio
          </h1>
        </div>
      </div>

      <Button 
        onClick={handleExport}
        className="bg-gradient-primary hover:opacity-90 transition-opacity"
      >
        <Download className="w-4 h-4 mr-2" />
        Export PNG
      </Button>
    </header>
  );
};
