// Base layer interface
export interface BaseLayer {
  id: string;
  type: 'text' | 'shape' | 'image' | 'drawing';
  name?: string;
  x: number;
  y: number;
  opacity: number;
  rotation: number;
  locked?: boolean;
  hidden?: boolean;
  blendMode?: GlobalCompositeOperation;
  scaleX?: number;
  scaleY?: number;
  shadow: {
    enabled: boolean;
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
  stroke: {
    enabled: boolean;
    color: string;
    width: number;
  };
}

// Text layer
export interface TextLayer extends BaseLayer {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  color: string;
  textAlign: "left" | "center" | "right";
  letterSpacing: number;
  lineHeight: number;
  gradient: {
    enabled: boolean;
    type: "linear" | "radial";
    colors: string[];
    angle: number;
  };
}

// Shape layer
export interface ShapeLayer extends BaseLayer {
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'ellipse' | 'triangle';
  width: number;
  height: number;
  fill: string;
  gradient?: {
    enabled: boolean;
    type: "linear" | "radial";
    colors: string[];
    angle: number;
  };
}

// Image layer
export interface ImageLayer extends BaseLayer {
  type: 'image';
  imageUrl: string;
  width: number;
  height: number;
}

// Drawing layer (free-form paths)
export interface DrawingLayer extends BaseLayer {
  type: 'drawing';
  pathData: string; // SVG path data
  strokeColor: string;
  strokeWidth: number;
}

// Union type for all layers
export type Layer = TextLayer | ShapeLayer | ImageLayer | DrawingLayer;


export const createDefaultLayer = (id: string): TextLayer => ({
  id,
  type: 'text',
  name: "Text Layer",
  text: "Double click to edit",
  x: 400,
  y: 300,
  fontSize: 48,
  fontFamily: "Inter",
  fontWeight: "bold",
  color: "#ffffff",
  opacity: 1,
  rotation: 0,
  textAlign: "center",
  letterSpacing: 0,
  lineHeight: 1.2,
  locked: false,
  hidden: false,
  blendMode: "source-over",
  scaleX: 1,
  scaleY: 1,
  shadow: {
    enabled: false,
    color: "#000000",
    blur: 10,
    offsetX: 0,
    offsetY: 4,
  },
  stroke: {
    enabled: false,
    color: "#000000",
    width: 2,
  },
  gradient: {
    enabled: false,
    type: "linear",
    colors: ["#00d4ff", "#b844ff"],
    angle: 135,
  },
});

export const createDefaultShape = (id: string, shapeType: ShapeLayer['shapeType']): ShapeLayer => ({
  id,
  type: 'shape',
  name: `${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)} Shape`,
  shapeType,
  x: 400,
  y: 300,
  width: shapeType === 'circle' ? 100 : 150,
  height: shapeType === 'circle' ? 100 : 100,
  fill: "#00d4ff",
  opacity: 1,
  rotation: 0,
  locked: false,
  hidden: false,
  blendMode: "source-over",
  scaleX: 1,
  scaleY: 1,
  shadow: {
    enabled: false,
    color: "#000000",
    blur: 10,
    offsetX: 0,
    offsetY: 4,
  },
  stroke: {
    enabled: false,
    color: "#000000",
    width: 2,
  },
  gradient: {
    enabled: false,
    type: "linear",
    colors: ["#00d4ff", "#b844ff"],
    angle: 135,
  },
});

export const createDefaultImage = (id: string, imageUrl: string, width: number, height: number): ImageLayer => ({
  id,
  type: 'image',
  name: "Image Layer",
  imageUrl,
  width,
  height,
  x: 400,
  y: 300,
  opacity: 1,
  rotation: 0,
  locked: false,
  hidden: false,
  blendMode: "source-over",
  scaleX: 1,
  scaleY: 1,
  shadow: {
    enabled: false,
    color: "#000000",
    blur: 10,
    offsetX: 0,
    offsetY: 4,
  },
  stroke: {
    enabled: false,
    color: "#000000",
    width: 0,
  },
});
