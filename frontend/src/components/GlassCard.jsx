import React from 'react';

export const GlassCard = ({ children, className = '', glow = false, heavy = false, ...props }) => {
  const baseStyle = heavy ? 'glass-panel-heavy' : 'glass-panel';
  const glowStyle = glow ? 'shadow-glass-glow border-sky-500/30' : 'shadow-glass';
  
  return (
    <div 
      className={`rounded-2xl p-6 transition-all duration-300 ${baseStyle} ${glowStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
