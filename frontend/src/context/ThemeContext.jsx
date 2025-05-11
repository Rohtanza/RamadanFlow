import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('quran_theme');
    return savedTheme || 'light';
  });

  useEffect(() => {
    // Remove previous theme classes
    document.documentElement.classList.remove('theme-light', 'theme-dark', 'theme-sepia');
    // Add new theme class
    document.documentElement.classList.add(`theme-${theme}`);
    // Save to localStorage
    localStorage.setItem('quran_theme', theme);
  }, [theme]);

  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}; 