import React from 'react';
import { HeatmapRegion } from '../types';

interface HeatmapOverlayProps {
  regions: HeatmapRegion[];
  show: boolean;
  width: number;
  height: number;
}

// Helper to generate color from Green -> Yellow -> Red based on intensity (0-1)
// Tweaked for better blending: lighter colors work better with Screen blend mode
export const getIntensityColor = (intensity: number) => {
  let r, g, b;
  
  if (intensity < 0.5) {
    // 0.0 - 0.5: Cyan/Teal -> Yellow
    // Adds a bit more blue at the low end for a "cooler" low confidence look
    const t = intensity * 2; 
    r = Math.round(50 + 205 * t); // Starts at 50, goes to 255
    g = 255;
    b = Math.round(200 * (1 - t)); 
  } else {
    // 0.5 - 1.0: Yellow -> Red/Pink
    const t = (intensity - 0.5) * 2;
    r = 255;
    g = Math.round(255 * (1 - t));
    b = Math.round(100 * t); // Adds some blue at high intensity for a "hot pink" core warning
  }
  
  return `rgb(${r}, ${g}, ${b})`;
};

export const HeatmapOverlay: React.FC<HeatmapOverlayProps> = ({ regions, show, width, height }) => {
  if (regions.length === 0) return null;

  return (
    <div 
      className={`absolute inset-0 pointer-events-none rounded-lg z-10 overflow-hidden transition-opacity duration-700 ease-in-out ${show ? 'opacity-100' : 'opacity-0'}`}
    >
      <style>
        {`
          @keyframes blob-pulse {
            0% { opacity: 0; transform: scale(0.8); }
            100% { opacity: 1; transform: scale(1); }
          }
          .blob-animate {
            animation: blob-pulse 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
            transform-box: fill-box;
            transform-origin: center;
          }
        `}
      </style>

      {/* 
         Layer 1: Visual Heatmap 
         mix-blend-screen is applied here specifically so it doesn't affect tooltips.
         Opacity is slightly reduced for subtlety, allowing the X-ray bones to show through clearly.
      */}
      <div className="absolute inset-0 mix-blend-screen opacity-90">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <defs>
            {/* 
               Sophisticated filter chain for organic look:
               1. Blur the source shape.
               2. Generate fractal noise (turbulence).
               3. Displace the blurred shape using noise to create irregular 'cloud' edges.
            */}
            <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
               <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
               <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise" />
               <feDisplacementMap in="blur" in2="noise" scale="3" />
            </filter>
          </defs>
          
          {regions.map((region, index) => {
            const cx = (region.x_min + region.x_max) / 2;
            const cy = (region.y_min + region.y_max) / 2;
            const rx = (region.x_max - region.x_min) / 2;
            const ry = (region.y_max - region.y_min) / 2;
            
            const color = getIntensityColor(region.intensity);
            const gradientId = `grad-${index}`;
            
            return (
              <React.Fragment key={`heatmap-blob-${index}`}>
                <defs>
                  <radialGradient id={gradientId} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" stopColor={color} stopOpacity={0.4 + (region.intensity * 0.4)} />
                    <stop offset="50%" stopColor={color} stopOpacity={0.2 + (region.intensity * 0.2)} />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                  </radialGradient>
                </defs>
                <ellipse
                  cx={cx}
                  cy={cy}
                  rx={rx * 1.1}
                  ry={ry * 1.1}
                  fill={`url(#${gradientId})`}
                  filter="url(#softGlow)"
                  className="transition-all duration-500 blob-animate"
                  style={{ animationDelay: `${index * 100}ms` }}
                />
              </React.Fragment>
            );
          })}
        </svg>
      </div>
      
      {/* 
         Layer 2: Interactive Tooltips 
         No blend mode ensures crisp text reading regardless of the underlying X-ray brightness.
         Pointer events are conditionally enabled only when shown.
      */}
      <div className={`absolute inset-0 ${show ? '' : 'pointer-events-none'}`}>
        {regions.map((region, index) => (
            <div
            key={`trigger-${index}`}
            className="absolute group pointer-events-auto cursor-help"
            style={{
                left: `${region.x_min}%`,
                top: `${region.y_min}%`,
                width: `${region.x_max - region.x_min}%`,
                height: `${region.y_max - region.y_min}%`,
            }}
            >
            {/* Dashed border only on hover */}
            <div className="absolute inset-0 border border-dashed border-white/0 group-hover:border-white/50 transition-colors duration-200 rounded-lg"></div>

            {/* Tooltip */}
            <div className="absolute left-1/2 -top-2 transform -translate-x-1/2 -translate-y-full opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-30 min-w-[180px]">
                <div className="bg-slate-900/95 backdrop-blur-md text-white text-xs p-3 rounded-lg shadow-xl border border-slate-700 flex flex-col gap-1 ring-1 ring-white/10">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-1.5 mb-1">
                        <span className="font-bold text-indigo-300">ROI #{index + 1}</span>
                        <span className="font-mono text-[10px] text-slate-400">
                            {(region.intensity * 100).toFixed(0)}% Intensity
                        </span>
                    </div>
                    <p className="text-slate-300 leading-snug font-light">{region.description}</p>
                    {/* Arrow */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-900/95"></div>
                </div>
            </div>
            </div>
        ))}
      </div>
    </div>
  );
};
