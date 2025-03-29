import React, { useRef, useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Annotation, AnnotationTool } from '@/lib/annotations';
import AnnotationLayer from './AnnotationLayer';

// Set up worker for PDF.js
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedText, setSelectedText] = useState<{
    text: string;
    rect: DOMRect | null;
  }>({ text: '', rect: null });
  const [pageDimensions, setPageDimensions] = useState({ width: 0, height: 0 });
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });
  
  // Store original PDF dimensions when page loads
  const handlePageLoadSuccess = (page: any) => {
    const { width, height } = page.getViewport({ scale: 1 });
    setPdfDimensions({ width, height });
    console.log(`PDF original dimensions: ${width}x${height}`);
  };
  
  // Update page dimensions whenever the scale changes
  useEffect(() => {
    const updatePageDimensions = () => {
      if (containerRef.current) {
        const pageElement = containerRef.current.querySelector('.react-pdf__Page');
        if (pageElement) {
          const { width, height } = pageElement.getBoundingClientRect();
          setPageDimensions({ width, height });
          console.log(`Page rendered dimensions at scale ${scale}: ${width}x${height}`);
        }
      }
    };
    
    // Run once after render
    const timer = setTimeout(updatePageDimensions, 500);
    
    // Update when scale changes
    window.addEventListener('resize', updatePageDimensions);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePageDimensions);
    };
  }, [scale, pageNumber]);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.toString() === '') {
      setSelectedText({ text: '', rect: null });
      return;
    }

    const range = selection.getRangeAt(0);
    const selectedContent = selection.toString();
    const rect = range.getBoundingClientRect();
    
    setSelectedText({ text: selectedContent, rect });
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === 'none') return;
    
    const container = containerRef.current;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const x = e.clientX - containerRect.left;
    const y = e.clientY - containerRect.top;
    
    // Enhanced metadata to improve accuracy during export
    const annotationMetadata = {
      originalScale: scale,
      pageWidth: pageDimensions.width,
      pageHeight: pageDimensions.height,
      pdfWidth: pdfDimensions.width,
      pdfHeight: pdfDimensions.height
    };

    if ((activeTool === 'highlight' || activeTool === 'underline') && selectedText.rect) {
      // Create annotation based on the selected text's bounding rectangle
      const selectionRect = selectedText.rect;
      const containerRect = container.getBoundingClientRect();
      
      const annotationX = selectionRect.left - containerRect.left;
      const annotationY = selectionRect.top - containerRect.top;
      
      console.log(`Creating ${activeTool} annotation at (${annotationX}, ${annotationY}) with metadata:`, annotationMetadata);
      
      onAnnotationCreate({
        type: activeTool,
        x: annotationX,
        y: annotationY,
        width: selectionRect.width,
        height: selectionRect.height,
        content: selectedText.text,
        color: selectedColor,
        pageNumber: pageNumber - 1, // Convert to 0-based for internal representation
        metadata: annotationMetadata
      });
      
      // Clear the selection after creating the annotation
      window.getSelection()?.removeAllRanges();
      setSelectedText({ text: '', rect: null });
    } else if (activeTool === 'comment') {
      console.log(`Creating comment annotation at (${x}, ${y}) with metadata:`, annotationMetadata);
      
      onAnnotationCreate({
        type: 'comment',
        x,
        y,
        content: '', // Will be filled in later by user
        pageNumber: pageNumber - 1, // Convert to 0-based
        metadata: annotationMetadata
      });
    } else if (activeTool === 'signature') {
      console.log(`Creating signature annotation at (${x}, ${y}) with metadata:`, annotationMetadata);
      
      onAnnotationCreate({
        type: 'signature',
        x,
        y,
        pageNumber: pageNumber - 1, // Convert to 0-based
        metadata: annotationMetadata
      });
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative mx-auto my-4"
      onClick={handleClick}
      onMouseUp={handleTextSelection}
      id="pdf-viewer-container"
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
          onLoadSuccess={handlePageLoadSuccess}
        />
      </Document>
      <AnnotationLayer 
        annotations={annotations.filter(a => a.pageNumber === pageNumber - 1)} // Convert from 0-based to 1-based
        pageNumber={pageNumber - 1} // Use 0-based internally
      />
      
      {/* Visual indicator for text selection when highlight/underline tool is active */}
      {(activeTool === 'highlight' || activeTool === 'underline') && selectedText.rect && (
        <div 
          className="absolute pointer-events-none"
          style={{
            left: containerRef.current ? selectedText.rect.left - containerRef.current.getBoundingClientRect().left + 'px' : '0px',
            top: containerRef.current ? selectedText.rect.top - containerRef.current.getBoundingClientRect().top + 'px' : '0px',
            width: selectedText.rect.width + 'px',
            height: selectedText.rect.height + 'px',
            backgroundColor: activeTool === 'highlight' ? `${selectedColor}50` : 'transparent',
            borderBottom: activeTool === 'underline' ? `2px solid ${selectedColor}` : 'none',
            zIndex: 50
          }}
        />
      )}
    </div>
  );
};

export default DocumentPage;