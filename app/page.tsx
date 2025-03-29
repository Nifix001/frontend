'use client'

import React, { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import UploadArea from '@/components/UploadArea';
import DocumentViewer from '@/components/DocumentViewer';
import AnnotationTools from '@/components/AnnotationTools';
import SignatureModal from '@/components/SignatureModal';
import CommentModal from '@/components/CommentModal';
import { Annotation, AnnotationTool } from '@/lib/annotations';
import { fileToArrayBuffer, applyAnnotationsToPDF, downloadPDF } from '@/lib/pdfUtils';
import { useToast } from '@/components/ui/use-toast';
import { useDocumentContext } from '@/context/DocumentContext';

const Home = () => {
  const [commentToEdit, setCommentToEdit] = React.useState<Annotation | null>(null);
  const {
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
    removeLastAnnotation,
    saveToLocalStorage,
    loadFromLocalStorage
  } = useDocumentContext();
  
  const { toast } = useToast();

  // Check for saved data on initial load
  useEffect(() => {
    const hasSavedData = loadFromLocalStorage();
    if (hasSavedData && annotations.length > 0) {
      toast({
        title: "Restored session",
        description: "Your previous work has been restored",
      });
    }
  }, []);

  const handleFileUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    // Keep existing annotations if the document looks the same,
    // otherwise clear them (optional - could prompt user instead)
    toast({
      title: "Document uploaded",
      description: `Successfully loaded ${uploadedFile.name}`,
    });
  };

  const handleToolChange = (tool: AnnotationTool) => {
    if (tool === selectedTool) {
      setSelectedTool('none');
    } else {
      setSelectedTool(tool);
    }
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
  };

  const handleAnnotationCreate = (annotation: Omit<Annotation, 'id'>) => {
    if (annotation.type === 'comment') {
      const existingComment = annotations.find(
        a => 
          a.type === 'comment' && 
          a.pageNumber === annotation.pageNumber &&
          Math.abs(a.x - annotation.x) < 10 && // Add some tolerance
          Math.abs(a.y - annotation.y) < 10
      );
  
      setTempPosition({
        x: annotation.x,
        y: annotation.y,
        pageNumber: annotation.pageNumber
      });
      
      // If we found an existing comment, we'll edit it instead of creating a new one
      if (existingComment) {
        // Pass the existing comment content as initialComment
        setCommentToEdit(existingComment);
        setIsCommentModalOpen(true);
      } else {
        // No existing comment, create a new one
        setCommentToEdit(null);
        setIsCommentModalOpen(true);
      }
    } else if (annotation.type === 'signature') {
      setTempPosition({
        x: annotation.x,
        y: annotation.y,
        pageNumber: annotation.pageNumber
      });
      setIsSignatureModalOpen(true);
    } else {
      const newAnnotation: Annotation = {
        ...annotation,
        id: uuidv4()
      };
      setAnnotations(prev => [...prev, newAnnotation]);
    }
  };

  const handleSignatureSave = (signatureDataUrl: string) => {
    if (tempPosition) {
      const newAnnotation: Annotation = {
        id: uuidv4(),
        type: 'signature',
        x: tempPosition.x,
        y: tempPosition.y,
        content: signatureDataUrl,
        pageNumber: tempPosition.pageNumber
      };
      setAnnotations(prev => [...prev, newAnnotation]);
      setIsSignatureModalOpen(false);
      setTempPosition(null);
    }
  };

  const handleCommentSave = (commentText: string) => {
    if (tempPosition) {
      if (commentToEdit) {
        // Update existing comment
        setAnnotations(prev => 
          prev.map(a => 
            a.id === commentToEdit.id 
              ? { ...a, content: commentText } 
              : a
          )
        );
      } else {
        // Create new comment
        const newAnnotation: Annotation = {
          id: uuidv4(),
          type: 'comment',
          x: tempPosition.x,
          y: tempPosition.y,
          content: commentText,
          pageNumber: tempPosition.pageNumber
        };
        setAnnotations(prev => [...prev, newAnnotation]);
      }
      setIsCommentModalOpen(false);
      setTempPosition(null);
      setCommentToEdit(null);
    }
  };

  const handleUndo = () => {
    removeLastAnnotation();
    toast({
      title: "Action undone",
      description: "The last annotation has been removed",
    });
  };

  // In your Home.tsx file, modify the handleExport function:

  const handleExport = async () => {
    if (!file) return;
    
    try {
      toast({
        title: "Processing",
        description: "Preparing your annotated document...",
      });
      
      // Debug annotations before export to help troubleshoot
      console.log('Exporting with annotations:', annotations);
      
      const pdfBytes = await fileToArrayBuffer(file);
      
      // Get a reference to your PDF viewer container to potentially calculate scaling
      const pdfViewerContainer = document.getElementById('pdf-viewer-container');
      if (pdfViewerContainer) {
        console.log('Viewer dimensions:', {
          width: pdfViewerContainer.clientWidth,
          height: pdfViewerContainer.clientHeight
        });
      }
      
      // Use page offset to fix the page numbering issue
      // The default value of -1 assumes UI uses 0-based indexing but there's an off-by-one error
      // You may need to adjust this value to 0, -1, or 1 based on testing
      const pageOffset = -1;
      
      const pdfDoc = await applyAnnotationsToPDF(pdfBytes, annotations, pageOffset);
      await downloadPDF(pdfDoc, `annotated-${file.name}`);
      
      toast({
        title: "Export Complete",
        description: "Your annotated document has been downloaded",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your document",
        variant: "destructive",
      });
    }
  };
     
  const handleSaveSession = () => {
    if (saveToLocalStorage()) {
      toast({
        title: "Session saved",
        description: "Your work has been saved in this browser",
      });
    } else {
      toast({
        title: "Failed to save",
        description: "There was an error saving your session",
        variant: "destructive",
      });
    }
  };

  const handleClearSession = () => {
    if (window.confirm("Are you sure you want to clear your work? This cannot be undone.")) {
      setAnnotations([]);
      localStorage.removeItem('documentSigner_annotations');
      localStorage.removeItem('documentSigner_fileMetadata');
      localStorage.removeItem('documentSigner_selectedColor');
      toast({
        title: "Session cleared",
        description: "All saved work has been cleared",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Document Signer- PDF Annotation Tool</h1>
        {annotations.length > 0 && (
          <button
            onClick={handleClearSession}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            Clear Session
          </button>
        )}
      </header>
      
      <main className="flex-1 flex flex-col lg:flex-row p-4 gap-4">
        {!file ? (
          <div className="w-full max-w-2xl mx-auto">
            <UploadArea onFileUpload={handleFileUpload} />
            {annotations.length > 0 && (
              <div className="mt-4 p-4 bg-yellow-100 rounded-lg">
                <p className="text-yellow-800">You have unsaved annotations from a previous session.</p>
                <p className="text-yellow-800">Please upload the same document to continue your work.</p>
              </div>
            )}
          </div>
        ) : (
          <>
            <aside className="w-full lg:w-64 flex-shrink-0">
            <AnnotationTools
              selectedTool={selectedTool}
              selectedColor={selectedColor}
              onToolChange={handleToolChange}
              onColorChange={handleColorChange}
              onExport={handleExport}
              onUndo={handleUndo}
              canUndo={annotations.length > 0}
              onSaveSession={handleSaveSession}
            />
            </aside>
            
            <div className="flex-1 overflow-hidden">
              <DocumentViewer
                file={file}
                activeTool={selectedTool}
                selectedColor={selectedColor}
                annotations={annotations}
                onAnnotationCreate={handleAnnotationCreate}
              />
            </div>
          </>
        )}
      </main>
      
      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => {
          setIsSignatureModalOpen(false);
          setTempPosition(null);
        }}
        onSave={handleSignatureSave}
      />
      
      <CommentModal
        isOpen={isCommentModalOpen}
        onClose={() => {
          setIsCommentModalOpen(false);
          setTempPosition(null);
          setCommentToEdit(null);
        }}
        onSave={handleCommentSave}
        initialComment={commentToEdit ? commentToEdit.content : ''}
      />
    </div>
  );
};

export default Home;