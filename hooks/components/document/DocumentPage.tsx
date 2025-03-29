
import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Annotation, AnnotationTool } from '@/lib/annotations';
import AnnotationLayer from './AnnotationLayer';

// Set up worker for PDF.js (we'll only do this once across components)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface DocumentPageProps {
  file: File;
  pageNumber: number;
  scale: number;
  annotations: Annotation[];
  activeTool: AnnotationTool;
  selectedColor: string;
  onDocumentLoadSuccess: (numPages: number) => void;
  onAnnotationCreate: (annotation: Omit<Annotation, 'id'>) => void;
}

const DocumentPage: React.FC<DocumentPageProps> = ({
  file,
  pageNumber,
  scale,
  annotations,
  activeTool,
  selectedColor,
  onDocumentLoadSuccess,
  onAnnotationCreate,
}) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === 'none') return;
    
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (activeTool === 'highlight' || activeTool === 'underline') {
      // For highlight and underline, we would normally select text
      // This is a simplified version where we just create a simple annotation
      onAnnotationCreate({
        type: activeTool,
        x,
        y,
        width: 100, // Just a placeholder value
        height: 20, // Just a placeholder value
        color: selectedColor,
        pageNumber,
      });
    } else if (activeTool === 'comment') {
      onAnnotationCreate({
        type: 'comment',
        x,
        y,
        pageNumber,
      });
    } else if (activeTool === 'signature') {
      onAnnotationCreate({
        type: 'signature',
        x,
        y,
        pageNumber,
      });
    }
  };

  return (
    <div 
      className="relative mx-auto my-4"
      onClick={handleClick}
    >
      <Document
        file={file}
        onLoadSuccess={({ numPages }) => onDocumentLoadSuccess(numPages)}
        className="flex justify-center"
      >
        <Page
          pageNumber={pageNumber}
          scale={scale}
          renderTextLayer={true}
          renderAnnotationLayer={true}
          className="shadow-lg"
        />
      </Document>
      <AnnotationLayer 
        annotations={annotations}
        pageNumber={pageNumber}
      />
    </div>
  );
};

export default DocumentPage;
