
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

interface UploadAreaProps {
  onFileUpload: (file: File) => void;
}

const UploadArea: React.FC<UploadAreaProps> = ({ onFileUpload }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  return (
    <div 
      {...getRootProps()} 
      className={`w-full h-96 flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 transition-colors ${
        isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
      }`}
    >
      <input {...getInputProps()} />
      <Upload className="w-16 h-16 text-gray-400 mb-4" />
      <p className="text-lg font-medium text-gray-700">
        {isDragActive ? 'Drop your PDF here' : 'Drag & drop your PDF here'}
      </p>
      <p className="text-sm text-gray-500 mt-2">or click to browse files</p>
      <p className="text-xs text-gray-400 mt-6">Supported format: PDF</p>
    </div>
  );
};

export default UploadArea;
