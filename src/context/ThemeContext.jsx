import React, { createContext, useContext, useState, useEffect } from 'react';
import { generatePalette } from '../utils/colorUtils';
import { useAuth } from './AuthContext';

const ThemeContext = createContext();

export const themes = {
  navy: {
    name: 'Navy Blue (Default)',
    colors: {
      50:  '238, 242, 255',
      100: '224, 231, 255',
      200: '199, 210, 254',
      300: '165, 180, 252',
      400: '129, 140, 248',
      500: '30, 58, 138',
      600: '30, 64, 175',
      700: '29, 78, 216',
      800: '37, 99, 235',
      900: '59, 130, 246',
    }
  },
  blue: {
    name: 'Sky Blue',
    colors: {
      50:  '239, 246, 255',
      100: '219, 234, 254',
      200: '191, 219, 254',
      300: '147, 197, 253',
      400: '96, 165, 250',
      500: '59, 130, 246',
      600: '37, 99, 235',
      700: '29, 78, 216',
      800: '30, 64, 175',
      900: '30, 58, 138',
    }
  },
  purple: {
    name: 'Purple',
    colors: {
      50:  '250, 245, 255',
      100: '243, 232, 255',
      200: '233, 213, 255',
      300: '216, 180, 254',
      400: '192, 132, 252',
      500: '168, 85, 247',
      600: '147, 51, 234',
      700: '126, 34, 206',
      800: '107, 33, 168',
      900: '88, 28, 135',
    }
  },
  indigo: {
    name: 'Indigo',
    colors: {
      50:  '238, 242, 255',
      100: '224, 231, 255',
      200: '199, 210, 254',
      300: '165, 180, 252',
      400: '129, 140, 248',
      500: '99, 102, 241',
      600: '79, 70, 229',
      700: '67, 56, 202',
      800: '55, 48, 163',
      900: '49, 46, 129',
    }
  },
  rose: {
    name: 'Rose',
    colors: {
      50:  '255, 241, 242',
      100: '255, 228, 230',
      200: '254, 205, 211',
      300: '253, 164, 175',
      400: '251, 113, 133',
      500: '244, 63, 94',
      600: '225, 29, 72',
      700: '190, 18, 60',
      800: '159, 18, 57',
      900: '136, 19, 55',
    }
  },
  orange: {
    name: 'Orange',
    colors: {
      50:  '255, 247, 237',
      100: '255, 237, 213',
      200: '254, 215, 170',
      300: '253, 186, 116',
      400: '251, 146, 60',
      500: '249, 115, 22',
      600: '234, 88, 12',
      700: '194, 65, 12',
      800: '154, 52, 18',
      900: '124, 45, 18',
    }
  }
};

export const ThemeProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const userId = currentUser?.id || 'guest';
  
  const [currentTheme, setCurrentTheme] = useState('navy');
  const [customColor, setCustomColor] = useState('#1e3a8a');

  // Load user-specific theme when user changes
  useEffect(() => {
    const savedTheme = localStorage.getItem(`aitel-theme-${userId}`);
    const savedColor = localStorage.getItem(`aitel-custom-color-${userId}`);

    // Migration: If they had 'green' or 'indigo' (old defaults), force reset
    if (savedTheme === 'green' || savedTheme === 'indigo' || !savedTheme) {
      setCurrentTheme('navy');
    } else {
      setCurrentTheme(savedTheme);
    }

    if (savedColor) setCustomColor(savedColor);
  }, [userId]);

  // Apply theme to DOM and save to localStorage
  useEffect(() => {
    const root = document.documentElement;

    if (currentTheme === 'custom') {
      root.removeAttribute('data-theme');
      const palette = generatePalette(customColor);
      Object.entries(palette).forEach(([level, value]) => {
        root.style.setProperty(`--color-accent-${level}`, value);
      });
    } else {
      root.setAttribute('data-theme', currentTheme);
      [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].forEach(level => {
        root.style.removeProperty(`--color-accent-${level}`);
      });
    }
    
    // Save only if not guest, or use guest key
    localStorage.setItem(`aitel-theme-${userId}`, currentTheme);
    localStorage.setItem(`aitel-custom-color-${userId}`, customColor);
  }, [currentTheme, customColor, userId]);

  const setTheme = (themeKey) => {
    if (themes[themeKey] || themeKey === 'custom') {
      setCurrentTheme(themeKey);
    }
  };

  const handleCustomColorChange = (hex) => {
    setCustomColor(hex);
    setCurrentTheme('custom');
  };

  return (
    <ThemeContext.Provider value={{ 
      currentTheme, 
      setTheme, 
      themes, 
      customColor, 
      setCustomColor: handleCustomColorChange 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
