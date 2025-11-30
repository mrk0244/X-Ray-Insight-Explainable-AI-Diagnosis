import React, { useState, useRef, useEffect } from 'react';
import { AnalysisResult } from '../types';
import { HeatmapOverlay } from './HeatmapOverlay';
import { AlertCircle, CheckCircle, Brain, Layers, Info, Eye, EyeOff } from 'lucide-react';

interface AnalysisViewProps {
  imageSrc: string;
  result: AnalysisResult;
  onReset: () => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ imageSrc, result, onReset }) => {
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (imgRef.current) {
        setImgDimensions({
          width: imgRef.current.offsetWidth,
          height: imgRef.current.offsetHeight,
        });
      }
    };

    window.addEventListener('resize', updateDimensions);
    // Initial update needs a slight delay or load check
    if(imgRef.current?.complete) updateDimensions();

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const isPneumonia = result.diagnosis === 'Pneumonia';
  const confidenceColor = result.confidence > 80 ? 'text-green-600' : result.confidence > 50 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[600px]">
      {/* Left Column: Image Viewer */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center relative">
        <div className="w-full flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Eye className="w-5 h-5 text-indigo-600" />
            Visual Explanation
          </h2>
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              showHeatmap 
                ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {showHeatmap ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {showHeatmap ? 'Hide Heatmap' : 'Show Heatmap'}
          </button>
        </div>

        <div className="relative rounded-lg overflow-hidden bg-slate-900 shadow-inner max-w-full">
            <img
                ref={imgRef}
                src={imageSrc}
                alt="X-Ray Analysis"
                className="max-h-[500px] w-auto object-contain block"
                onLoad={() => {
                   if (imgRef.current) {
                    setImgDimensions({
                        width: imgRef.current.offsetWidth,
                        height: imgRef.current.offsetHeight
                    });
                   }
                }}
            />
            <HeatmapOverlay
                regions={result.heatmap_regions}
                show={showHeatmap}
                width={imgDimensions.width}
                height={imgDimensions.height}
            />
        </div>

        <div className="mt-4 text-sm text-slate-500 flex items-center gap-2">
           <Info className="w-4 h-4" />
           {showHeatmap 
             ? "Colored regions indicate areas the AI focused on to make its diagnosis (Simulated Grad-CAM)." 
             : "Showing original medical image."}
        </div>
      </div>

      {/* Right Column: Diagnostic Report */}
      <div className="lg:w-[400px] bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col overflow-y-auto">
        <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Diagnosis</span>
                <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Confidence</span>
            </div>
            <div className="flex items-center justify-between">
                <div className={`text-3xl font-extrabold flex items-center gap-3 ${isPneumonia ? 'text-red-600' : 'text-emerald-600'}`}>
                    {isPneumonia ? <AlertCircle className="w-8 h-8" /> : <CheckCircle className="w-8 h-8" />}
                    {result.diagnosis}
                </div>
                <div className={`text-2xl font-bold ${confidenceColor}`}>
                    {result.confidence}%
                </div>
            </div>
        </div>

        <div className="space-y-6">
            <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-indigo-500" />
                    AI Reasoning
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {result.summary}
                </p>
            </div>

            <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-500" />
                    Key Findings
                </h3>
                <ul className="space-y-2">
                    {result.findings.map((finding, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0"></span>
                            {finding}
                        </li>
                    ))}
                </ul>
            </div>
        </div>

        <div className="mt-auto pt-8">
            <button
                onClick={onReset}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-all transform active:scale-95 shadow-lg shadow-slate-200"
            >
                Analyze Another Image
            </button>
        </div>
      </div>
    </div>
  );
};