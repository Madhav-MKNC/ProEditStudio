import { useState } from "react";
import { Canvas } from "@/components/editor/Canvas";
import { Toolbar } from "@/components/editor/Toolbar";
import { PropertiesPanel } from "@/components/editor/PropertiesPanel";
import { LayersPanel } from "@/components/editor/LayersPanel";
import { Header } from "@/components/editor/Header";
import { TextLayer } from "@/types/editor";

const Index = () => {
  const [layers, setLayers] = useState<TextLayer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

  const selectedLayer = layers.find(layer => layer.id === selectedLayerId) || null;

  const updateLayer = (id: string, updates: Partial<TextLayer>) => {
    setLayers(layers.map(layer => 
      layer.id === id ? { ...layer, ...updates } : layer
    ));
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

  return (
    <div className="h-screen w-full bg-editor-bg flex flex-col overflow-hidden">
      <Header 
        layers={layers}
        backgroundImage={backgroundImage}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <Toolbar onAddText={addLayer} />
        
        <div className="flex-1 flex items-center justify-center p-4">
          <Canvas
            layers={layers}
            selectedLayerId={selectedLayerId}
            backgroundImage={backgroundImage}
            onSelectLayer={setSelectedLayerId}
            onUpdateLayer={updateLayer}
            onBackgroundImageChange={setBackgroundImage}
          />
        </div>

        <div className="w-80 flex flex-col gap-4 p-4 bg-editor-panel border-l border-border overflow-y-auto">
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
