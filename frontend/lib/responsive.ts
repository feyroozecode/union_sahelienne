/**
 * Responsive Design Utilities
 * Breakpoints and media query helpers for mobile-first design
 */

export const breakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
};

export const mediaQueries = {
  mobile: `(max-width: ${breakpoints.mobile}px)`,
  tablet: `(max-width: ${breakpoints.tablet}px)`,
  desktop: `(max-width: ${breakpoints.desktop}px)`,
  wide: `(min-width: ${breakpoints.wide}px)`,
  tabletUp: `(min-width: ${breakpoints.tablet + 1}px)`,
  desktopUp: `(min-width: ${breakpoints.desktop + 1}px)`,
};

export const responsiveStyles = {
  // Responsive padding
  padding: {
    mobile: '12px',
    tablet: '16px',
    desktop: '20px',
  },
  
  // Responsive font sizes
  fontSize: {
    mobile: '14px',
    tablet: '16px',
    desktop: '16px',
  },
  
  // Responsive gaps/spacing
  gap: {
    mobile: '8px',
    tablet: '12px',
    desktop: '16px',
  },
  
  // Touch-friendly minimum button size
  minButtonHeight: '44px',
  minButtonWidth: '44px',
};

/**
 * Generate responsive style object
 * Usage: getResponsiveStyle({ mobile: '100%', tablet: '50%', desktop: '33%' })
 */
export const getResponsiveStyle = (styles: {
  mobile?: string | number;
  tablet?: string | number;
  desktop?: string | number;
}) => {
  return styles;
};
