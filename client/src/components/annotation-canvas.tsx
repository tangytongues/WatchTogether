import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Eraser, MousePointer, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnnotationCanvasProps {
  roomId: string;
  participantId: string;
  username: string;
  onAnnotationAdded?: (annotation: any) => void;
  onAnnotationsCleared?: () => void;
  onPointerMoved?: (x: number, y: number) => void;
}

type Tool = 'draw' | 'erase' | 'pointer';

export function AnnotationCanvas({
  roomId,
  participantId,
  username,
  onAnnotationAdded = (data) => {
    fetch(`/api/rooms/${roomId}/annotations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: participantId,
        username,
        ...data,
      }),
    });
  },
  onAnnotationsCleared = () => {
    fetch(`/api/rooms/${roomId}/annotations`, {
      method: 'DELETE',
    });
  },
  onPointerMoved,
}: AnnotationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('pointer');
  const [isDrawing, setIsDrawing] = useState(false);
  const [pointers, setPointers] = useState<Map<string, { x: number; y: number }>>(new Map());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === 'pointer') return;
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'pointer') {
      onPointerMoved?.(x, y);
      return;
    }

    if (!isDrawing) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = tool === 'draw' ? '#3b82f6' : '#ffffff';

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);

    if (onAnnotationAdded) {
      onAnnotationAdded({
        type: tool,
        data: { x, y },
      });
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      onAnnotationsCleared?.();
    }
  };

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        data-testid="canvas-annotation"
        className="absolute inset-0 w-full h-full cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseMove={draw}
        onMouseLeave={stopDrawing}
      />
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-background/80 backdrop-blur-sm rounded-lg p-2 shadow-lg">
        <Button
          data-testid="button-tool-pointer"
          size="sm"
          variant={tool === 'pointer' ? 'default' : 'outline'}
          onClick={() => setTool('pointer')}
        >
          <MousePointer className="h-4 w-4" />
        </Button>
        <Button
          data-testid="button-tool-draw"
          size="sm"
          variant={tool === 'draw' ? 'default' : 'outline'}
          onClick={() => setTool('draw')}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          data-testid="button-tool-erase"
          size="sm"
          variant={tool === 'erase' ? 'default' : 'outline'}
          onClick={() => setTool('erase')}
        >
          <Eraser className="h-4 w-4" />
        </Button>
        <Button
          data-testid="button-clear"
          size="sm"
          variant="destructive"
          onClick={clearCanvas}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {Array.from(pointers.entries()).map(([id, pos]) => (
        <div
          key={id}
          data-testid={`pointer-${id}`}
          className="absolute w-4 h-4 bg-red-500 rounded-full pointer-events-none"
          style={{
            left: `${pos.x}px`,
            top: `${pos.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  );
}
