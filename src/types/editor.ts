export interface TextLayer {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  color: string;
  opacity: number;
  rotation: number;
  textAlign: "left" | "center" | "right";
  letterSpacing: number;
  lineHeight: number;
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
  gradient: {
    enabled: boolean;
    type: "linear" | "radial";
    colors: string[];
    angle: number;
  };
}

export const createDefaultLayer = (id: string): TextLayer => ({
  id,
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
