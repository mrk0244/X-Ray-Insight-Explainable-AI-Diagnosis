import React, { useRef, useState } from 'react';
import { UploadCloud, FileImage, MousePointerClick } from 'lucide-react';
import { AppState } from '../types';

interface UploaderProps {
  onImageSelected: (base64: string) => void;
  state: AppState;
}

export const Uploader: React.FC<UploaderProps> = ({ onImageSelected, state }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onImageSelected(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300
          ${isDragging 
            ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' 
            : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50 bg-white'
          }
        `}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={`p-4 rounded-full ${isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
            <UploadCloud className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-slate-800">
              Upload Chest X-Ray
            </h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">
              Drag and drop your medical image here, or click to browse files.
            </p>
          </div>
        </div>

        {/* Example hint */}
        <div className="absolute bottom-4 left-0 right-0 text-center">
            <span className="text-xs text-slate-400 bg-white px-2">Supported formats: PNG, JPG, JPEG</span>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <DemoCard 
             title="Normal Case" 
             desc="Healthy lung fields"
             src="https://raw.githubusercontent.com/rmotr/chest-xray-pneumonia-dataset/master/chest_xray/train/NORMAL/IM-0115-0001.jpeg"
             onSelect={onImageSelected}
          />
          <DemoCard 
             title="Pneumonia (Viral)" 
             desc="Diffuse interstitial opacities"
             src="https://raw.githubusercontent.com/rmotr/chest-xray-pneumonia-dataset/master/chest_xray/train/PNEUMONIA/person1000_virus_1669.jpeg"
             onSelect={onImageSelected}
          />
          <DemoCard 
             title="Pneumonia (Bacteria)" 
             desc="Focal lobar consolidation"
             src="https://raw.githubusercontent.com/rmotr/chest-xray-pneumonia-dataset/master/chest_xray/train/PNEUMONIA/person101_bacteria_483.jpeg"
             onSelect={onImageSelected}
          />
      </div>
    </div>
  );
};

// Helper component for demo images to quickly test
const DemoCard = ({ title, desc, src, onSelect }: { title: string, desc: string, src: string, onSelect: (s: string) => void }) => {
    const handleSelect = async () => {
        try {
            const response = await fetch(src);
            const blob = await response.blob();
            const reader = new FileReader();
            reader.onload = () => onSelect(reader.result as string);
            reader.readAsDataURL(blob);
        } catch (e) {
            console.error("Failed to load demo image", e);
        }
    };

    return (
        <button 
            onClick={handleSelect}
            className="group flex flex-col items-start p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:shadow-md transition-all text-left"
        >
            <div className="flex items-center gap-3 mb-2">
                <FileImage className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-slate-700 text-sm">{title}</span>
            </div>
            <p className="text-xs text-slate-500">{desc}</p>
        </button>
    )
}