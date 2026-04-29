import React from 'react';

/**
 * Reusable Skeleton component for loading states.
 * @param {string} width - Width of the skeleton (e.g. '100%', '20px')
 * @param {string} height - Height of the skeleton (e.g. '20px')
 * @param {string} variant - Shape of the skeleton: 'text' (default), 'circle', 'rect'
 * @param {object} style - Additional styles
 * @param {string} className - Additional CSS classes
 */
export default function Skeleton({ 
  width = '100%', 
  height = '20px', 
  variant = 'text', 
  style = {}, 
  className = '' 
}) {
  const baseStyle = {
    width,
    height,
    ...style
  };

  const variantClass = variant === 'circle' 
    ? 'rounded-full' 
    : variant === 'rect' 
      ? 'rounded-lg' 
      : 'rounded-md';

  return (
    <div 
      className={`skeleton ${variantClass} ${className}`} 
      style={baseStyle}
    />
  );
}
