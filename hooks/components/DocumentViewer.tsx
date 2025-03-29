
import React, { useState } from 'react';
import { Annotation, AnnotationTool } from '@/lib/annotations';
import DocumentControls from './document/DocumentControls';
import DocumentPage from './document/DocumentPage';

interface DocumentViewerProps {
  file: File | null;
  activeTool: AnnotationTool;
  selectedColor: string;
  annotations: Annotation[];
  onAnnotationCreate: (annotation: Omit<Annotation, 'id'>) => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  file,
  activeTool,
  selectedColor,
  annotations,
  onAnnotationCreate
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  const onDocumentLoadSuccess = (numPages: number) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const changePage = (offset: number) => {
    if (!numPages) return;
    
    const newPageNumber = pageNumber + offset;
    if (newPageNumber >= 1 && newPageNumber <= numPages) {
      setPageNumber(newPageNumber);
    }
  };

  const zoomIn = () => setScale(prevScale => Math.min(prevScale + 0.1, 2.5));
  const zoomOut = () => setScale(prevScale => Math.max(prevScale - 0.1, 0.5));

  if (!file) {
    return null;
  }

  return (
    <div className="relative flex flex-col items-center bg-gray-100 rounded-lg overflow-hidden">
      <DocumentControls
        pageNumber={pageNumber}
        numPages={numPages}
        scale={scale}
        onChangePage={changePage}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
      />

      <div className="relative overflow-auto w-full h-full">
        <DocumentPage
          file={file}
          pageNumber={pageNumber}
          scale={scale}
          annotations={annotations}
          activeTool={activeTool}
          selectedColor={selectedColor}
          onDocumentLoadSuccess={onDocumentLoadSuccess}
          onAnnotationCreate={onAnnotationCreate}
        />
      </div>
    </div>
  );
};

export default DocumentViewer;
