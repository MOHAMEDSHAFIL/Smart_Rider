import React from 'react';
import { useSmartRider } from '../../context/SmartRiderContext';

export const ScanlineOverlay: React.FC = () => {
  const { scanlinesEnabled, theme } = useSmartRider();

  if (!scanlinesEnabled) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden" 
      aria-hidden="true"
    >
      {/* Static CRT Scanlines Texture */}
      <div 
        className="absolute inset-0 crt-scanlines"
        style={{
          opacity: theme === 'dark' ? 0.045 : 0.012
        }}
      />

      {/* Subtle Slow CRT Beam Sweep (Dark Mode Only) */}
      {theme === 'dark' && (
        <div 
          className="absolute inset-x-0 h-32 bg-gradient-to-b from-transparent via-crt-green/[0.015] to-transparent animate-scanline" 
          style={{ willChange: 'transform' }}
        />
      )}
    </div>
  );
};
