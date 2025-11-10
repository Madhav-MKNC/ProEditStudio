import { useState, useEffect } from "react";
import { Canvas } from "@/components/editor/Canvas";
import { Toolbar } from "@/components/editor/Toolbar";
import { PropertiesPanel } from "@/components/editor/PropertiesPanel";
import { LayersPanel } from "@/components/editor/LayersPanel";
import { Header } from "@/components/editor/Header";
import { ZoomControls } from "@/components/editor/ZoomControls";
import { TextLayer } from "@/types/editor";
import { useHistory } from "@/hooks/useHistory";

const Index = () => {
  const { state: layers, set: setLayers, undo, redo, canUndo, canRedo } = useHistory<TextLayer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [activeTool, setActiveTool] = useState('select');

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

  const handleZoomIn = () => setZoom(Math.min(zoom + 0.1, 3));
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.1, 0.1));
  const handleZoomReset = () => setZoom(1);

  return (
    <div className="h-screen w-full bg-editor-bg flex flex-col overflow-hidden">
      <Header 
        layers={layers}
        backgroundImage={backgroundImage}
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
        
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center p-6 relative">
            <Canvas
              layers={layers}
              selectedLayerId={selectedLayerId}
              backgroundImage={backgroundImage}
              onSelectLayer={setSelectedLayerId}
              onUpdateLayer={updateLayer}
              onBackgroundImageChange={setBackgroundImage}
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

        <div className="w-72 flex flex-col gap-3 p-3 bg-editor-panel border-l border-border overflow-y-auto">
          <PropertiesPanel
            selectedLayer={selectedLayer}
            onUpdateLayer={updateLayer}
          />
          
          <LayersPanel
            layers={layers}
            selectedLayerId={selectedLayerId}
            onSelectLayer={setSelectedLayerId}
            onDeleteLayer={deleteLayer}
            onDuplicateLayer={duplicateLayer}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
