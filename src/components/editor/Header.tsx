import { Button } from "@/components/ui/button";
import { Download, Save, FolderOpen, Settings, FileImage, FileType, Palette } from "lucide-react";
import { Layer } from "@/types/editor";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { HistoryControls } from "./HistoryControls";
import { useRef } from "react";

interface HeaderProps {
  layers: Layer[];
  backgroundImage: string | null;
  backgroundFit?: 'contain' | 'cover' | 'stretch';
  onNewProject?: () => void;
  onOpenProject?: (project: any) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const Header = ({ layers, backgroundImage, backgroundFit, onNewProject, onOpenProject, onUndo, onRedo, canUndo, canRedo }: HeaderProps) => {
  const handleExport = (format: 'png' | 'jpg' | 'svg') => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `design.${format}`;
    link.href = canvas.toDataURL(format === 'jpg' ? 'image/jpeg' : 'image/png');
    link.click();
  };

  const projectFileRef = useRef<HTMLInputElement>(null);

  const handleSaveProject = () => {
    const data = JSON.stringify({ layers, backgroundImage, backgroundFit }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'project.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const project = JSON.parse(reader.result as string);
        onOpenProject?.(project);
      } catch {}
    };
    reader.readAsText(file);
    e.currentTarget.value = '';
  };

  return (
    <header className="h-14 bg-editor-panel border-b border-border flex items-center justify-between px-4">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <img src="/favicon.ico" alt="ProEdit Studio" className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            ProEdit Studio
          </h1>
        </div>

        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">File</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onNewProject?.()}>
                <FolderOpen className="w-4 h-4 mr-2" />
                New Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => projectFileRef.current?.click()}>
                <FolderOpen className="w-4 h-4 mr-2" />
                Open
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSaveProject}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExport('png')}>
                Export as PNG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('jpg')}>
                Export as JPG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('svg')}>
                Export as SVG
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">Edit</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={onUndo} disabled={!canUndo}>
                Undo
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onRedo} disabled={!canRedo}>
                Redo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">Image</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <FileImage className="w-4 h-4 mr-2" />
                Image Size
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileImage className="w-4 h-4 mr-2" />
                Canvas Size
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="sm">Layer</Button>
          <Button variant="ghost" size="sm">Type</Button>
          <Button variant="ghost" size="sm">Filter</Button>
          <Button variant="ghost" size="sm">View</Button>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <HistoryControls
          onUndo={onUndo}
          onRedo={onRedo}
          canUndo={canUndo}
          canRedo={canRedo}
        />
        
        <Button
          onClick={() => handleExport('png')}
          className="bg-gradient-primary hover:opacity-90"
          size="sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
        
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
      <input ref={projectFileRef} type="file" accept="application/json" className="hidden" onChange={handleOpenFileChange} />
    </header>
  );
};
