
import React from 'react';
import { Annotation } from '@/lib/annotations';

interface AnnotationLayerProps {
  annotations: Annotation[];
  pageNumber: number;
}

const AnnotationLayer: React.FC<AnnotationLayerProps> = ({ annotations, pageNumber }) => {
  return (
    <>
      {annotations
        .filter(ann => ann.pageNumber === pageNumber)
        .map(ann => {
          switch (ann.type) {
            case 'highlight':
              return (
                <div
                  key={ann.id}
                  className="absolute pointer-events-none opacity-40"
                  style={{
                    left: `${ann.x}px`,
                    top: `${ann.y}px`,
                    width: `${ann.width}px`,
                    height: `${ann.height}px`,
                    backgroundColor: ann.color,
                  }}
                />
              );
            case 'underline':
              return (
                <div
                  key={ann.id}
                  className="absolute pointer-events-none"
                  style={{
                    left: `${ann.x}px`,
                    top: `${ann.y + (ann.height || 0)}px`,
                    width: `${ann.width}px`,
                    height: '2px',
                    backgroundColor: ann.color,
                  }}
                />
              );
            case 'comment':
              return (
                <div
                  key={ann.id}
                  className="absolute flex items-center justify-center w-8 h-8 rounded-full bg-yellow-400 text-white cursor-pointer"
                  style={{
                    left: `${ann.x - 16}px`,
                    top: `${ann.y - 16}px`,
                  }}
                  title={ann.content}
                >
                  <span className="text-xs font-bold">💬</span>
                </div>
              );
            case 'signature':
              return (
                <div
                  key={ann.id}
                  className="absolute"
                  style={{
                    left: `${ann.x}px`,
                    top: `${ann.y}px`,
                  }}
                >
                  <img 
                    src={ann.content} 
                    alt="Signature" 
                    className="max-w-xs max-h-24"
                  />
                </div>
              );
            default:
              return null;
          }
        })}
    </>
  );
};

export default AnnotationLayer;
