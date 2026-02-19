
import React, { useRef, useState } from 'react';
import { Upload, AlertTriangle, Image as ImageIcon, CheckCircle2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageData } from '../types';

interface ImageUploaderProps {
  label: string;
  description: string;
  onImageSelect: (image: ImageData) => void;
  currentImage?: ImageData;
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

    if (file.size > 5 * 1024 * 1024) {
      setError("File exceeds 5MB limit.");
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError("Please use JPG, PNG, or WEBP.");
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
    reader.onerror = () => setError("Read error. Try again.");
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndProcessFile(file);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center px-1">
        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{label}</label>
        <AnimatePresence>
          {error && (
            <motion.span
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[9px] font-bold text-red-400 uppercase tracking-wider"
            >
              {error}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); const file = e.dataTransfer.files?.[0]; if (file) validateAndProcessFile(file); }}
        className={`
          relative border-2 border-dashed rounded-[1.5rem] p-4 flex flex-col items-center justify-center transition-all cursor-pointer h-40 overflow-hidden group
          ${error
            ? 'border-red-500/50 bg-red-500/5'
            : isDragging
              ? 'border-indigo-500 bg-indigo-500/10'
              : currentImage
                ? 'border-indigo-500/50 bg-indigo-500/5'
                : 'border-white/10 hover:border-white/20 bg-white/5'
          }
        `}
      >
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

        {currentImage ? (
          <div className="relative w-full h-full">
            <img
              src={`data:${currentImage.mimeType};base64,${currentImage.base64}`}
              alt="Preview"
              className="w-full h-full object-cover rounded-xl"
            />
            <div className="absolute inset-0 bg-indigo-600/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all rounded-xl">
              <RefreshCw className="text-white w-6 h-6 animate-spin-slow" />
              <span className="ml-2 text-white text-[10px] font-black uppercase tracking-widest">Update</span>
            </div>
            <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-lg">
              <CheckCircle2 className="w-3 h-3 text-indigo-600" />
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 mx-auto transition-colors ${error ? 'bg-red-500/20' : 'bg-white/5 group-hover:bg-indigo-500/20'}`}>
              {error ? (
                <AlertTriangle className="text-red-400 w-5 h-5" />
              ) : (
                <Upload className="text-white/40 group-hover:text-indigo-400 w-5 h-5" />
              )}
            </div>
            <p className={`text-[11px] font-black uppercase tracking-widest ${error ? 'text-red-400' : 'text-white/60'}`}>
              {error ? 'INVALID UPLOAD' : 'DROP IMAGE'}
            </p>
            <p className="text-[9px] text-white/20 mt-1 font-bold uppercase tracking-tighter">
              {description}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ImageUploader;
