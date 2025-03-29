import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signatureDataUrl: string) => void;
}

const SignatureModal: React.FC<SignatureModalProps> = ({ isOpen, onClose, onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const [strokes, setStrokes] = useState<{ x: number, y: number }[][]>([]);
  const [currentStroke, setCurrentStroke] = useState<{ x: number, y: number }[]>([]);

  // Create a function to redraw everything - this ensures we can see what's happening
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas first
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set drawing style
    ctx.lineWidth = 3; // Make it thicker for visibility
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000000';
    
    // Draw all stored strokes
    strokes.forEach(stroke => {
      if (stroke.length < 2) return;
      
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      
      ctx.stroke();
    });
    
    // Draw current stroke
    if (currentStroke.length >= 2) {
      ctx.beginPath();
      ctx.moveTo(currentStroke[0].x, currentStroke[0].y);
      
      for (let i = 1; i < currentStroke.length; i++) {
        ctx.lineTo(currentStroke[i].x, currentStroke[i].y);
      }
      
      ctx.stroke();
    }
    
    // Draw a test line to confirm the canvas is working
    if (strokes.length === 0 && currentStroke.length === 0) {
      ctx.beginPath();
      ctx.moveTo(50, 50);
      ctx.lineTo(100, 100);
      ctx.stroke();
      console.log("Drew test line");
    }
  };

  // Initialize when modal opens
  useEffect(() => {
    if (isOpen) {
      // Clear state
      setStrokes([]);
      setCurrentStroke([]);
      setIsDrawing(false);
      
      // Force redraw in the next tick after DOM is updated
      setTimeout(() => {
        redrawCanvas();
        console.log("Canvas initialized on modal open");
      }, 100);
    }
  }, [isOpen]);

  // Redraw whenever strokes change
  useEffect(() => {
    redrawCanvas();
  }, [strokes, currentStroke]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    
    console.log("Raw coordinates:", { clientX, clientY, canvasX: x, canvasY: y });
    
    return { x, y };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    // Prevent default behavior
    if ('touches' in e) {
      e.preventDefault();
    }
    
    const { x, y } = getCoordinates(e);
    setIsDrawing(true);
    setLastPosition({ x, y });
    setCurrentStroke([{ x, y }]);
    
    console.log("Started drawing at", { x, y });
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    // Prevent default behavior
    if ('touches' in e) {
      e.preventDefault();
    }
    
    const { x, y } = getCoordinates(e);
    
    // Only record points if they've moved a certain distance
    const dx = x - lastPosition.x;
    const dy = y - lastPosition.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 1) { // Minimum distance to reduce points
      setLastPosition({ x, y });
      setCurrentStroke(prev => [...prev, { x, y }]);
      console.log("Drawing at", { x, y });
    }
  };

  const endDrawing = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    if (currentStroke.length > 1) {
      setStrokes(prev => [...prev, currentStroke]);
      console.log("Stroke completed with", currentStroke.length, "points");
    }
    setCurrentStroke([]);
    console.log("Ended drawing");
  };

  const clearCanvas = () => {
    setStrokes([]);
    setCurrentStroke([]);
    console.log("Canvas cleared");
  };

  const saveSignature = () => {
    if (!canvasRef.current) return;
    
    if (strokes.length === 0) {
      alert("Please draw your signature before saving.");
      return;
    }
    
    try {
      // Force redraw to ensure everything is rendered
      redrawCanvas();
      
      // Get the data URL
      const dataUrl = canvasRef.current.toDataURL('image/png');
      console.log("Generated signature data URL:", {
        length: dataUrl.length,
        preview: dataUrl.substring(0, 50) + '...'
      });
      
      if (dataUrl.length <= 5) {
        console.error("Invalid data URL generated");
        alert("Error generating signature. Please try again.");
        return;
      }
      
      onSave(dataUrl);
    } catch (err) {
      console.error("Error generating signature:", err);
      alert("Error generating signature. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Draw Your Signature</DialogTitle>
        </DialogHeader>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-1 bg-white">
          <canvas
            ref={canvasRef}
            width={400}
            height={200}
            className="w-full bg-white rounded"
            style={{ 
              touchAction: 'none',
              border: '1px solid #ccc' // Add visible border
            }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={endDrawing}
            onMouseLeave={endDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={endDrawing}
          />
        </div>
        <div className="text-center text-xs text-gray-500">
          {strokes.length > 0 ? (
            `${strokes.length} strokes with ${strokes.reduce((acc, stroke) => acc + stroke.length, 0)} points`
          ) : (
            "Draw your signature above"
          )}
        </div>
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={clearCanvas}>Clear</Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={saveSignature}>Save Signature</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SignatureModal;