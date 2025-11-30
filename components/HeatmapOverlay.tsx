import React from 'react';
import { HeatmapRegion } from '../types';

interface HeatmapOverlayProps {
  regions: HeatmapRegion[];
  show: boolean;
  width: number;
  height: number;
}

export const HeatmapOverlay: React.FC<HeatmapOverlayProps> = ({ regions, show, width, height }) => {
  if (!show || regions.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 100 100`}
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full opacity-60 mix-blend-multiply"
      >
        <defs>
          <filter id="blurFilter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
          </filter>
        </defs>
        {regions.map((region, index) => {
          // Calculate center and radii for an ellipse approximation of the box
          const cx = (region.x_min + region.x_max) / 2;
          const cy = (region.y_min + region.y_max) / 2;
          const rx = (region.x_max - region.x_min) / 2;
          const ry = (region.y_max - region.y_min) / 2;
          
          // Color based on intensity/severity (Red for high, Yellow for medium)
          const color = region.intensity > 0.7 ? "rgb(255, 0, 0)" : "rgb(255, 165, 0)";
          
          return (
            <ellipse
              key={index}
              cx={cx}
              cy={cy}
              rx={rx}
              ry={ry}
              fill={color}
              filter="url(#blurFilter)"
              opacity={region.intensity}
            />
          );
        })}
      </svg>
      
      {/* Tooltip-like markers for exact locations */}
      {regions.map((region, index) => (
        <div
          key={`label-${index}`}
          className="absolute border-2 border-white/50 bg-black/40 text-white text-[10px] px-1 rounded transform -translate-y-full opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-auto cursor-help"
          style={{
            left: `${region.x_min}%`,
            top: `${region.y_min}%`,
            width: `${region.x_max - region.x_min}%`,
            height: `${region.y_max - region.y_min}%`,
          }}
          title={region.description}
        >
          {/* Invisible trigger area strictly matching the box */}
        </div>
      ))}
    </div>
  );
};