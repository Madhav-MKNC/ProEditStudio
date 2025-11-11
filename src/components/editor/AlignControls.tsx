import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AlignPosition =
  | "tl" | "tc" | "tr"
  | "cl" | "cc" | "cr"
  | "bl" | "bc" | "br";

interface AlignControlsProps {
  onAlign: (pos: AlignPosition) => void;
  className?: string;
}

export const AlignControls = ({ onAlign, className }: AlignControlsProps) => {
  const positions: AlignPosition[] = [
    "tl", "tc", "tr",
    "cl", "cc", "cr",
    "bl", "bc", "br",
  ];

  const labels: Record<AlignPosition, string> = {
    tl: "Top Left",
    tc: "Top Center",
    tr: "Top Right",
    cl: "Left",
    cc: "Center",
    cr: "Right",
    bl: "Bottom Left",
    bc: "Bottom Center",
    br: "Bottom Right",
  };

  return (
    <div className={cn("grid grid-cols-3 gap-1 bg-editor-panel border border-border rounded-md p-1 shadow-panel", className)}>
      {positions.map((pos) => (
        <Button
          key={pos}
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          title={labels[pos]}
          onClick={() => onAlign(pos)}
        >
          {/* Simple dot indicator positioning */}
          <span className={cn(
            "block h-1.5 w-1.5 rounded-full bg-foreground/70",
            pos === "tl" && "justify-self-start self-start",
            pos === "tc" && "justify-self-center self-start",
            pos === "tr" && "justify-self-end self-start",
            pos === "cl" && "justify-self-start self-center",
            pos === "cc" && "justify-self-center self-center",
            pos === "cr" && "justify-self-end self-center",
            pos === "bl" && "justify-self-start self-end",
            pos === "bc" && "justify-self-center self-end",
            pos === "br" && "justify-self-end self-end",
          )} />
        </Button>
      ))}
    </div>
  );
};
