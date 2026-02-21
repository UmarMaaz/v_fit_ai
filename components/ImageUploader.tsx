
import React, { useRef, useState } from 'react';
import { ImageData } from '../types';

interface ImageUploaderProps {
  label: string;
  description: string;
  onImageSelect: (image: ImageData) => void;
  currentImage?: ImageData;
  multiple?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  description,
  onImageSelect,
  currentImage
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateAndProcessFile = (file: File) => {
    setError(null);

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      setError("File is too large. Maximum size is 5MB.");
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError("Invalid file type. Please upload an image (JPG, PNG, WEBP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64 = reader.result.split(',')[1];
        onImageSelect({
          id: Math.random().toString(36).substr(2, 9),
          base64,
          mimeType: file.type,
          name: file.name
        });
      }
    };
    reader.onerror = () => {
      setError("Failed to read file. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between items-baseline">
        <label className="text-sm font-semibold text-slate-700">{label}</label>
        {error && <span className="text-xs font-medium text-red-500 animate-pulse">{error}</span>}
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer
          ${error
            ? 'border-red-300 bg-red-50 hover:border-red-400'
            : isDragging
              ? 'border-indigo-500 bg-indigo-50'
              : currentImage
                ? 'border-indigo-400 bg-indigo-50/30'
                : 'border-slate-300 hover:border-indigo-300 bg-white'
          }
          h-40 sm:h-48 overflow-hidden group
        `}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />

        {currentImage ? (
          <div className="relative w-full h-full">
            <img
              src={`data:${currentImage.mimeType};base64,${currentImage.base64}`}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
              <span className="text-white text-xs font-medium">Click to Change</span>
            </div>
          </div>
        ) : (
          <>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${error ? 'bg-red-100' : 'bg-slate-100 group-hover:bg-indigo-100'}`}>
              {error ? (
                <i className="fa-solid fa-triangle-exclamation text-red-500"></i>
              ) : (
                <i className="fa-solid fa-cloud-arrow-up text-slate-400 group-hover:text-indigo-500"></i>
              )}
            </div>
            <p className={`text-sm font-medium ${error ? 'text-red-600' : 'text-slate-600'}`}>
              {error ? 'Upload Failed' : 'Drag & Drop or Click'}
            </p>
            <p className={`text-xs mt-1 ${error ? 'text-red-400' : 'text-slate-400'}`}>
              {error || description}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
