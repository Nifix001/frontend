
import React from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

interface DocumentControlsProps {
  pageNumber: number;
  numPages: number | null;
  scale: number;
  onChangePage: (offset: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const DocumentControls: React.FC<DocumentControlsProps> = ({
  pageNumber,
  numPages,
  scale,
  onChangePage,
  onZoomIn,
  onZoomOut,
}) => {
  return (
    <div className="sticky top-0 z-10 flex justify-between items-center w-full p-2 bg-white text-black border-b">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onChangePage(-1)}
          disabled={pageNumber <= 1}
          className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm">
          Page {pageNumber} of {numPages || '?'}
        </span>
        <button
          onClick={() => onChangePage(1)}
          disabled={numPages !== null && pageNumber >= numPages}
          className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={onZoomOut}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <span className="text-sm">{Math.round(scale * 100)}%</span>
        <button
          onClick={onZoomIn}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default DocumentControls;
