import { useState, useEffect } from "react";
import { Canvas } from "@/components/editor/Canvas";
import { Toolbar } from "@/components/editor/Toolbar";
import { PropertiesPanel } from "@/components/editor/PropertiesPanel";
import { LayersPanel } from "@/components/editor/LayersPanel";
import { Header } from "@/components/editor/Header";
import { ZoomControls } from "@/components/editor/ZoomControls";
import { TextLayer } from "@/types/editor";
import { useHistory } from "@/hooks/useHistory";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

const Index = () => {
  const { state: layers, set: setLayers, undo, redo, canUndo, canRedo } = useHistory<TextLayer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [activeTool, setActiveTool] = useState('select');
  const [backgroundFit, setBackgroundFit] = useState<'contain' | 'cover' | 'stretch'>('contain');

  const selectedLayer = layers.find(layer => layer.id === selectedLayerId) || null;

  const updateLayer = (id: string, updates: Partial<TextLayer>) => {
    const newLayers = layers.map(layer =>
      layer.id === id ? { ...layer, ...updates } : layer
    );
    setLayers(newLayers);
  };

  const addLayer = (layer: TextLayer) => {
    setLayers([...layers, layer]);
    setSelectedLayerId(layer.id);
  };

  const deleteLayer = (id: string) => {
    setLayers(layers.filter(layer => layer.id !== id));
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
    const layer = layers.find(l => l.id === id);
    if (!layer) return;
    updateLayer(id, { locked: !layer.locked });
  };

  const toggleHide = (id: string) => {
    const layer = layers.find(l => l.id === id);
    if (!layer) return;
    updateLayer(id, { hidden: !layer.hidden });
  };

  const renameLayer = (id: string, name: string) => {
    updateLayer(id, { name });
  };

  const handleNewProject = () => {
    setLayers([]);
    setSelectedLayerId(null);
    setBackgroundImage(null);
    setBackgroundFit('contain');
  };

  const handleOpenProject = (project: { layers: TextLayer[]; backgroundImage: string | null; backgroundFit?: 'contain' | 'cover' | 'stretch' }) => {
    setLayers(project.layers || []);
    setSelectedLayerId(null);
    setBackgroundImage(project.backgroundImage || null);
    setBackgroundFit(project.backgroundFit || 'contain');
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
          onAddText={addLayer}
          activeTool={activeTool}
          onToolChange={setActiveTool}
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
                  onBackgroundImageChange={setBackgroundImage}
                  zoom={zoom}
                  backgroundFit={backgroundFit}
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
