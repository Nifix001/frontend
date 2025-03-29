'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Annotation, AnnotationTool } from '@/lib/annotations';

// Define the shape of our context state
interface DocumentContextState {
  file: File | null;
  selectedTool: AnnotationTool;
  selectedColor: string;
  annotations: Annotation[];
  isSignatureModalOpen: boolean;
  isCommentModalOpen: boolean;
  tempPosition: { x: number; y: number; pageNumber: number } | null;
  setFile: (file: File | null) => void;
  setSelectedTool: (tool: AnnotationTool) => void;
  setSelectedColor: (color: string) => void;
  setAnnotations: React.Dispatch<React.SetStateAction<Annotation[]>>;
  setIsSignatureModalOpen: (isOpen: boolean) => void;
  setIsCommentModalOpen: (isOpen: boolean) => void;
  setTempPosition: (position: { x: number; y: number; pageNumber: number } | null) => void;
  addAnnotation: (annotation: Annotation) => void;
  removeLastAnnotation: () => void;
  clearAnnotations: () => void;
  saveToLocalStorage: () => boolean;
  loadFromLocalStorage: () => boolean;
}

// Create the context
const DocumentContext = createContext<DocumentContextState | undefined>(undefined);

// Create a provider component
export const DocumentProvider = ({ children }: { children: React.ReactNode }) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileMetadata, setFileMetadata] = useState<{ name: string, size: number, type: string } | null>(null);
  const [selectedTool, setSelectedTool] = useState<AnnotationTool>('none');
  const [selectedColor, setSelectedColor] = useState('#FFEB3B');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [tempPosition, setTempPosition] = useState<{ x: number; y: number; pageNumber: number } | null>(null);
  const [hasStoredSession, setHasStoredSession] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    loadFromLocalStorage();
  }, []);

  // Add a single annotation
  const addAnnotation = (annotation: Annotation) => {
    setAnnotations(prev => [...prev, annotation]);
  };

  // Remove the last annotation (undo)
  const removeLastAnnotation = () => {
    setAnnotations(prev => {
      if (prev.length === 0) return prev;
      const updatedAnnotations = [...prev];
      updatedAnnotations.pop();
      return updatedAnnotations;
    });
  };

  // Clear all annotations
  const clearAnnotations = () => {
    setAnnotations([]);
  };

  // Save state to localStorage
 // In DocumentContext.tsx

// Define keys for localStorage
const KEYS = {
  FILE_METADATA: 'documentSigner_fileMetadata',
  ANNOTATIONS: 'documentSigner_annotations',
  SELECTED_COLOR: 'documentSigner_selectedColor'
};

// Save state to localStorage
const saveToLocalStorage = (): boolean => {
  try {
    // Save file metadata (we cannot store the actual File object)
    if (file) {
      const metadata = {
        name: file.name,
        size: file.size,
        type: file.type
      };
      setFileMetadata(metadata);
      localStorage.setItem(KEYS.FILE_METADATA, JSON.stringify(metadata));
    }

    // Save annotations directly - no need to modify them
    // Add logging to see what's being saved
    console.log("Saving annotations:", annotations);
    localStorage.setItem(KEYS.ANNOTATIONS, JSON.stringify(annotations));
    
    // Save selected color
    localStorage.setItem(KEYS.SELECTED_COLOR, selectedColor);
    
    // Update the stored session flag
    setHasStoredSession(true);
    
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

const loadFromLocalStorage = (): boolean => {
  try {
    // Load annotations
    const savedAnnotations = localStorage.getItem(KEYS.ANNOTATIONS);
    if (savedAnnotations) {
      const parsedAnnotations = JSON.parse(savedAnnotations);
      // Ensure annotation content is properly parsed, especially for comments
      setAnnotations(parsedAnnotations);
    }
    
    // Load selected color
    const savedColor = localStorage.getItem(KEYS.SELECTED_COLOR);
    if (savedColor) {
      setSelectedColor(savedColor);
    }
    
    // Load file metadata (actual file needs to be re-uploaded)
    const savedFileMetadata = localStorage.getItem(KEYS.FILE_METADATA);
    if (savedFileMetadata) {
      setFileMetadata(JSON.parse(savedFileMetadata));
      setHasStoredSession(true);
      return true;
    }
    
    return savedAnnotations !== null;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return false;
  }
};

  // Replace the current useEffect hook for loading data
useEffect(() => {
  const hasData = loadFromLocalStorage();
  if (hasData) {
    console.log("Loaded data from localStorage");
    // Make sure we're not resetting annotations by loading again in future effects
    setHasStoredSession(true);
  }
}, []);

// Make sure annotations are correctly saved when they change
useEffect(() => {
  if (annotations.length > 0) {
    console.log("Auto-saving annotations:", annotations.length);
    saveToLocalStorage();
  }
}, [annotations]);

  // When file changes, store in localStorage
  useEffect(() => {
    if (file) {
      saveToLocalStorage();
    }
  }, [file]);

  const value = {
    file,
    selectedTool,
    selectedColor,
    annotations,
    isSignatureModalOpen,
    isCommentModalOpen,
    tempPosition,
    setFile,
    setSelectedTool,
    setSelectedColor,
    setAnnotations,
    setIsSignatureModalOpen,
    setIsCommentModalOpen,
    setTempPosition,
    addAnnotation,
    removeLastAnnotation,
    clearAnnotations,
    saveToLocalStorage,
    loadFromLocalStorage
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};

// Custom hook to use the document context
export const useDocumentContext = () => {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocumentContext must be used within a DocumentProvider');
  }
  return context;
};