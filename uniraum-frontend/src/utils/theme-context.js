import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Check if theme preference exists in local storage
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    
    // If user has a saved preference, use that
    if (savedTheme) {
      return savedTheme;
    }
    
    // Otherwise check for OS preference
    const prefersDark = window.matchMedia && 
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    return prefersDark ? 'dark' : 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);

  // Apply theme class to document body
  useEffect(() => {
    const body = document.body;
    
    // Remove existing theme classes
    body.classList.remove('light-theme', 'dark-theme');
    
    // Add current theme class
    body.classList.add(`${theme}-theme`);
    
    // Save theme to local storage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Function to toggle theme
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;