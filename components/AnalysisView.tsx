import React, { useState, useRef, useEffect } from 'react';
import { AnalysisResult } from '../types';
import { HeatmapOverlay, getIntensityColor } from './HeatmapOverlay';
import { AlertCircle, CheckCircle, Brain, Layers, Info, Eye, EyeOff, ZoomIn, ZoomOut, Maximize, Move, Download } from 'lucide-react';

interface AnalysisViewProps {
  imageSrc: string;
  result: AnalysisResult;
  onReset: () => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ imageSrc, result, onReset }) => {
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Zoom & Pan state
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
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
    if(imgRef.current?.complete) updateDimensions();

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Reset position when zooming out to 100%
  useEffect(() => {
    if (scale === 1) {
        setPosition({ x: 0, y: 0 });
    }
  }, [scale]);

  const handleZoomIn = () => setScale(s => Math.min(s + 0.5, 4));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.5, 1));
  const handleResetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      e.preventDefault();
      setIsDragging(true);
      dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      e.preventDefault();
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleDownload = async () => {
    if (!imgRef.current || isDownloading) return;
    setIsDownloading(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set dimensions to match actual image resolution
      canvas.width = imgRef.current.naturalWidth;
      canvas.height = imgRef.current.naturalHeight;

      // 1. Draw original X-Ray
      ctx.drawImage(imgRef.current, 0, 0);

      // 2. Draw Heatmap if visible
      if (showHeatmap && result.heatmap_regions.length > 0) {
        // Construct SVG string matching the HeatmapOverlay component logic
        const svgHeader = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 100 100" preserveAspectRatio="none">`;
        
        let defs = `<defs>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
             <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
             <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise" />
             <feDisplacementMap in="blur" in2="noise" scale="3" />
          </filter>`;
        
        result.heatmap_regions.forEach((region, index) => {
           const color = getIntensityColor(region.intensity);
           defs += `
            <radialGradient id="grad-${index}" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stop-color="${color}" stop-opacity="${0.4 + (region.intensity * 0.4)}" />
              <stop offset="50%" stop-color="${color}" stop-opacity="${0.2 + (region.intensity * 0.2)}" />
              <stop offset="100%" stop-color="${color}" stop-opacity="0" />
            </radialGradient>`;
        });
        defs += `</defs>`;

        let shapes = '';
        result.heatmap_regions.forEach((region, index) => {
           const cx = (region.x_min + region.x_max) / 2;
           const cy = (region.y_min + region.y_max) / 2;
           const rx = (region.x_max - region.x_min) / 2;
           const ry = (region.y_max - region.y_min) / 2;
           
           shapes += `<ellipse 
              cx="${cx}" cy="${cy}" 
              rx="${rx * 1.1}" ry="${ry * 1.1}" 
              fill="url(#grad-${index})" 
              filter="url(#softGlow)" 
           />`;
        });

        const svgString = `${svgHeader}${defs}${shapes}</svg>`;
        
        const img = new Image();
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        await new Promise((resolve, reject) => {
          img.onload = () => {
              // Simulate mix-blend-mode: screen and opacity
              ctx.save();
              ctx.globalCompositeOperation = 'screen';
              ctx.globalAlpha = 0.9;
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              ctx.restore();
              URL.revokeObjectURL(url);
              resolve(null);
          };
          img.onerror = reject;
          img.src = url;
        });
      }

      // 3. Trigger Download
      const link = document.createElement('a');
      link.download = `xray-analysis-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error("Failed to generate download", e);
    } finally {
      setIsDownloading(false);
    }
  };

  const isPneumonia = result.diagnosis === 'Pneumonia';
  const confidenceColor = result.confidence > 80 
    ? 'text-green-600 dark:text-green-400' 
    : result.confidence > 50 
        ? 'text-yellow-600 dark:text-yellow-400' 
        : 'text-red-600 dark:text-red-400';

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[600px] animate-fade-in">
      {/* Left Column: Image Viewer */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col relative transition-colors">
        <div className="w-full flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 transition-colors">
            <Eye className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Visual Explanation
          </h2>
          <div className="flex items-center gap-2">
             <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700 transition-colors">
                <button onClick={handleZoomOut} className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm rounded-md transition-all disabled:opacity-50" disabled={scale <= 1} title="Zoom Out">
                    <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono w-12 text-center text-slate-500 dark:text-slate-400">{Math.round(scale * 100)}%</span>
                <button onClick={handleZoomIn} className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm rounded-md transition-all disabled:opacity-50" disabled={scale >= 4} title="Zoom In">
                    <ZoomIn className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1"></div>
                <button onClick={handleResetView} className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm rounded-md transition-all" title="Reset View">
                    <Maximize className="w-4 h-4" />
                </button>
             </div>

             <button 
                onClick={handleDownload}
                disabled={isDownloading}
                className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors hover:shadow-sm disabled:opacity-50"
                title="Download Image"
             >
                <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
             </button>
             
             <button
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                showHeatmap 
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50' 
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
            >
                {showHeatmap ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span className="hidden sm:inline">{showHeatmap ? 'Hide Heatmap' : 'Show Heatmap'}</span>
            </button>
          </div>
        </div>

        {/* Viewport */}
        <div 
            className="relative flex-1 rounded-xl overflow-hidden bg-slate-900 shadow-inner flex items-center justify-center border border-slate-800"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ 
                cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                minHeight: '400px'
            }}
        >
            <div 
                className="relative transition-transform duration-75 ease-out will-change-transform"
                style={{ 
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                    transformOrigin: 'center',
                }}
            >
                <img
                    ref={imgRef}
                    src={imageSrc}
                    alt="X-Ray Analysis"
                    className="max-h-[500px] w-auto object-contain block select-none pointer-events-none" 
                    draggable={false}
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

            {/* Hint Overlay if zoomed out */}
            {scale === 1 && (
                 <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white/80 text-xs px-3 py-1 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    Zoom to inspect details
                 </div>
            )}
        </div>

        <div className="mt-4 text-sm text-slate-500 dark:text-slate-400 flex items-center justify-between transition-colors">
           <div className="flex items-center gap-2">
             <Info className="w-4 h-4 text-slate-400" />
             {showHeatmap 
                ? <span>Heatmap regions indicate <strong className="text-slate-700 dark:text-slate-300">high attention</strong> areas.</span>
                : <span>Displaying original radiograph without overlays.</span>}
           </div>
           {scale > 1 && (
               <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-xs font-medium animate-pulse">
                   <Move className="w-3 h-3" />
                   Drag to pan
               </div>
           )}
        </div>
      </div>

      {/* Right Column: Diagnostic Report */}
      <div className="lg:w-[400px] bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col overflow-y-auto max-h-[calc(100vh-120px)] sticky top-24 transition-colors">
        <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Diagnosis</span>
                <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Confidence</span>
            </div>
            <div className="flex items-center justify-between">
                <div className={`text-3xl font-extrabold flex items-center gap-3 ${isPneumonia ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
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
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2 transition-colors">
                    <Brain className="w-4 h-4 text-indigo-500" />
                    AI Reasoning
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700 transition-colors">
                    {result.summary}
                </p>
            </div>

            <div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2 transition-colors">
                    <Layers className="w-4 h-4 text-indigo-500" />
                    Key Findings
                </h3>
                <ul className="space-y-2">
                    {result.findings.map((finding, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
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
                className="w-full py-3 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white rounded-xl font-medium transition-all transform active:scale-95 shadow-lg shadow-slate-200 dark:shadow-none"
            >
                Analyze Another Image
            </button>
        </div>
      </div>
    </div>
  );
};