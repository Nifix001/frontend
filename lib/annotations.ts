
export type Annotation = {
  id: string;
  type: 'highlight' | 'underline' | 'comment' | 'signature';
  x: number;
  y: number;
  width?: number;
  height?: number;
  color?: string;
  content?: string;
  pageNumber: number;
};

export type AnnotationTool = 'highlight' | 'underline' | 'comment' | 'signature' | 'none';
