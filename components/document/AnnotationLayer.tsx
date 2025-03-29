import React from 'react';
import { Annotation } from '@/lib/annotations';

interface AnnotationLayerProps {
  annotations: Annotation[];
  pageNumber: number;
}

const AnnotationLayer: React.FC<AnnotationLayerProps> = ({ annotations, pageNumber }) => {
  // Filter annotations for the current page
  const pageAnnotations = annotations.filter(ann => ann.pageNumber === pageNumber);

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
      {pageAnnotations.map((annotation) => {
        switch (annotation.type) {
          case 'highlight':
            return (
              <div
                key={annotation.id}
                className="absolute"
                style={{
                  left: `${annotation.x}px`,
                  top: `${annotation.y}px`,
                  width: `${annotation.width || 100}px`,
                  height: `${annotation.height || 20}px`,
                  backgroundColor: `${annotation.color || '#FFEB3B'}50`,
                  zIndex: 10,
                }}
                title={annotation.content || 'Highlighted text'}
              />
            );
          case 'underline':
            return (
              <div
                key={annotation.id}
                className="absolute"
                style={{
                  left: `${annotation.x}px`,
                  top: `${annotation.y + (annotation.height || 20) - 2}px`, // Position at bottom of text
                  width: `${annotation.width || 100}px`,
                  height: '2px',
                  backgroundColor: annotation.color || '#FF0000',
                  zIndex: 10,
                }}
                title={annotation.content || 'Underlined text'}
              />
            );
          case 'comment':
            return (
              <div
                key={annotation.id}
                className="absolute flex items-center justify-center"
                style={{
                  left: `${annotation.x - 10}px`,
                  top: `${annotation.y - 10}px`,
                  width: '20px',
                  height: '20px',
                  backgroundColor: '#FFC107',
                  borderRadius: '50%',
                  zIndex: 20,
                  cursor: 'pointer',
                  pointerEvents: 'all', // Make this clickable
                }}
                title={annotation.content || 'Comment'}
              >
                <span className="text-white text-xs font-bold">!</span>
                
                {/* Comment tooltip/bubble (optional) */}
                {annotation.content && (
                  <div className="absolute left-full ml-2 p-2 bg-white shadow-md rounded text-xs max-w-xs z-30 pointer-events-none hidden group-hover:block">
                    {annotation.content}
                  </div>
                )}
              </div>
            );
          case 'signature':
            return annotation.content ? (
              <div
                key={annotation.id}
                className="absolute"
                style={{
                  left: `${annotation.x}px`,
                  top: `${annotation.y}px`,
                  zIndex: 30,
                }}
              >
                <img 
                  src={annotation.content} 
                  alt="Signature" 
                  style={{ maxWidth: '200px', maxHeight: '100px' }} 
                />
              </div>
            ) : null;
          default:
            return null;
        }
      })}
    </div>
  );
};

export default AnnotationLayer;