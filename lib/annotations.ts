export type AnnotationTool = 'none' | 'highlight' | 'underline' | 'comment' | 'signature';

export interface AnnotationMetadata {
  originalScale: number;
  pageWidth: number;
  pageHeight: number;
  pdfWidth?: number;  // Original PDF width at scale 1.0
  pdfHeight?: number; // Original PDF height at scale 1.0
}

export interface Annotation {
  id: string;
  type: AnnotationTool;
  x: number;
  y: number;
  pageNumber: number; // Use 0-based indexing internally for consistency
  width?: number;
  height?: number;
  color?: string;
  content?: string;
  metadata?: AnnotationMetadata;
}