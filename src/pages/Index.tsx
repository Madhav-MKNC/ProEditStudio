import { useState, useEffect, useRef } from "react";
import { Canvas } from "@/components/editor/Canvas";
import { Toolbar } from "@/components/editor/Toolbar";
import { PropertiesPanel } from "@/components/editor/PropertiesPanel";
import { LayersPanel } from "@/components/editor/LayersPanel";
import { Header } from "@/components/editor/Header";
import { ZoomControls } from "@/components/editor/ZoomControls";
import { Layer } from "@/types/editor";
import { useHistory } from "@/hooks/useHistory";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

const Index = () => {
  const { state: layers, set: setLayers, undo, redo, canUndo, canRedo } = useHistory<Layer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [activeTool, setActiveTool] = useState('select');
  const [backgroundFit, setBackgroundFit] = useState<'contain' | 'cover' | 'stretch'>('contain');
  const [drawingColor, setDrawingColor] = useState('#ffffff');
  const imageInputRef = useRef<HTMLInputElement>(null);

  const selectedLayer = layers.find(layer => layer.id === selectedLayerId) || null;

  const updateLayer = (id: string, updates: any) => {
    setLayers((prev: any) => prev.map((layer: any) =>
      layer.id === id ? { ...layer, ...updates } : layer
    ));
  };
  const addLayer = (layer: Layer) => {
    setLayers((prev) => [...prev, layer]);
    setSelectedLayerId(layer.id);
  };
  const deleteLayer = (id: string) => {
    setLayers((prev) => prev.filter((layer) => layer.id !== id));
    if (selectedLayerId === id) {
      setSelectedLayerId(null);
    }
  };
  const duplicateLayer = (id: string) => {
    const layer = layers.find(l => l.id === id);
    if (layer) {
      const newLayer = {
        ...layer,
        id: `layer-${Date.now()}`,
        x: layer.x + 20,
        y: layer.y + 20,
      };
      addLayer(newLayer);
    }
  };

  const toggleLock = (id: string) => {
    setLayers((prev) => prev.map((l) => l.id === id ? { ...l, locked: !l.locked } : l));
  };
  const toggleHide = (id: string) => {
    setLayers((prev) => prev.map((l) => l.id === id ? { ...l, hidden: !l.hidden } : l));
  };
  const renameLayer = (id: string, name: string) => {
    setLayers((prev) => prev.map((l) => l.id === id ? { ...l, name } : l));
  };
  const handleNewProject = () => {
    setLayers([]);
    setSelectedLayerId(null);
    setBackgroundImage(null);
    setBackgroundFit('contain');
  };

  const handleOpenProject = (project: any) => {
    setLayers(project.layers || []);
    setSelectedLayerId(null);
    setBackgroundImage(project.backgroundImage || null);
    setBackgroundFit(project.backgroundFit || 'contain');
  };

  const handleImageUpload = () => {
    imageInputRef.current?.click();
  };

  const handleZoomIn = () => setZoom(Math.min(zoom + 0.1, 3));
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.1, 0.1));
  const handleZoomReset = () => setZoom(1);

  return (
    <div className="h-screen w-full bg-editor-bg flex flex-col overflow-hidden">
      <Header
        layers={layers}
        backgroundImage={backgroundImage}
        backgroundFit={backgroundFit}
        onNewProject={handleNewProject}
        onOpenProject={handleOpenProject}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <Toolbar
          onAddLayer={addLayer}
          activeTool={activeTool}
          onToolChange={setActiveTool}
          onImageUpload={handleImageUpload}
        />

        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={75} minSize={50}>
            <div className="flex-1 flex flex-col h-full">
              <div className="flex-1 flex items-center justify-center p-6 relative">
                <Canvas
                  layers={layers}
                  selectedLayerId={selectedLayerId}
                  backgroundImage={backgroundImage}
                  onSelectLayer={setSelectedLayerId}
                  onUpdateLayer={updateLayer}
                  onAddLayer={addLayer}
                  onBackgroundImageChange={setBackgroundImage}
                  zoom={zoom}
                  backgroundFit={backgroundFit}
                  activeTool={activeTool}
                  drawingColor={drawingColor}
                  imageInputRef={imageInputRef}
                />
              </div>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
                <ZoomControls
                  zoom={zoom}
                  onZoomIn={handleZoomIn}
                  onZoomOut={handleZoomOut}
                  onZoomReset={handleZoomReset}
                />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-border w-2 flex items-center justify-center">
            {/* Optional handle visual */}
            <div className="w-1 h-8 bg-gray-400 rounded-full" />
          </ResizableHandle>

          <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
            <div className="w-full h-full flex flex-col gap-3 p-3 bg-editor-panel border-l border-border overflow-y-auto">
              <LayersPanel
                layers={layers}
                selectedLayerId={selectedLayerId}
                onSelectLayer={setSelectedLayerId}
                onDeleteLayer={deleteLayer}
                onDuplicateLayer={duplicateLayer}
                onToggleLock={toggleLock}
                onToggleHide={toggleHide}
                onRenameLayer={renameLayer}
              />

              <PropertiesPanel
                selectedLayer={selectedLayer}
                onUpdateLayer={updateLayer}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default Index;
