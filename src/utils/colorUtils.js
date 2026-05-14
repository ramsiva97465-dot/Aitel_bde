/**
 * Utility to generate a Tailwind-like color palette (50-900) from a single hex color.
 */

// Helper to convert hex to RGB
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

// Helper to convert RGB to HSL
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h, s, l };
}

// Helper to convert HSL to RGB
function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

/**
 * Generates a full 50-900 palette from a base color.
 * The base color is treated as the "600" weight.
 */
export function generatePalette(baseHex) {
  const { r, g, b } = hexToRgb(baseHex);
  const { h, s, l } = rgbToHsl(r, g, b);

  // Lightness levels for 50-900 (approximate Tailwind defaults)
  const lightnessMap = {
    50:  0.96,
    100: 0.92,
    200: 0.84,
    300: 0.72,
    400: 0.60,
    500: 0.50,
    600: l,    // Use the actual selected color's lightness for 600
    700: Math.max(0, l - 0.1),
    800: Math.max(0, l - 0.2),
    900: Math.max(0, l - 0.3),
  };

  const palette = {};
  Object.entries(lightnessMap).forEach(([level, light]) => {
    const rgb = hslToRgb(h, s, light);
    palette[level] = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
  });

  return palette;
}
