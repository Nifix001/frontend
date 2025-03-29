import React from 'react';
import { Highlighter, Underline, MessageSquare, PenTool, Undo, Save } from 'lucide-react';
import ColorPicker from './ColorPicker';
import { AnnotationTool } from '@/lib/annotations';

interface AnnotationToolsProps {
  selectedTool: AnnotationTool;
  selectedColor: string;
  onToolChange: (tool: AnnotationTool) => void;
  onColorChange: (color: string) => void;
  onExport: () => void;
  onUndo: () => void;
  canUndo: boolean;
  onSaveSession?: () => void;
}

const AnnotationTools: React.FC<AnnotationToolsProps> = ({
  selectedTool,
  selectedColor,
  onToolChange,
  onColorChange,
  onExport,
  onUndo,
  canUndo,
  onSaveSession
}) => {
  return (
    <div className="flex flex-col bg-white rounded-lg shadow-md p-3">
      <div className="flex flex-col space-y-2 mb-4">
        <button
          onClick={() => onToolChange('highlight')}
          className={`flex items-center p-2 rounded transition-colors ${
            selectedTool === 'highlight' ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Highlighter className="w-5 h-5 mr-2" />
          <span>Highlight</span>
        </button>
        
        <button
          onClick={() => onToolChange('underline')}
          className={`flex items-center p-2 rounded transition-colors ${
            selectedTool === 'underline' ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Underline className="w-5 h-5 mr-2" />
          <span>Underline</span>
        </button>
        
        <button
          onClick={() => onToolChange('comment')}
          className={`flex items-center p-2 rounded transition-colors ${
            selectedTool === 'comment' ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <MessageSquare className="w-5 h-5 mr-2" />
          <span>Comment</span>
        </button>
        
        <button
          onClick={() => onToolChange('signature')}
          className={`flex items-center p-2 rounded transition-colors ${
            selectedTool === 'signature' ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <PenTool className="w-5 h-5 mr-2" />
          <span>Signature</span>
        </button>
      </div>
      
      {(selectedTool === 'highlight' || selectedTool === 'underline') && (
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-1">Color</p>
          <ColorPicker 
            selectedColor={selectedColor} 
            onColorChange={onColorChange} 
          />
        </div>
      )}
      
      <div className="mt-4 mb-4 space-y-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`flex items-center justify-center w-full p-2 rounded transition-colors ${
            canUndo 
              ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Undo className="w-5 h-5 mr-2" />
          <span>Undo Last Action</span>
        </button>
        
        {onSaveSession && (
          <button
            onClick={onSaveSession}
            className="flex items-center justify-center w-full p-2 rounded transition-colors bg-green-100 text-green-600 hover:bg-green-200"
          >
            <Save className="w-5 h-5 mr-2" />
            <span>Save Session</span>
          </button>
        )}
      </div>
      
      <div className="mt-auto">
        <button
          onClick={onExport}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors"
        >
          Export PDF
        </button>
      </div>
    </div>
  );
};

export default AnnotationTools;