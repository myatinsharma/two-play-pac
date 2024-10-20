import React from 'react';

const ThemeToggle = ({ theme, toggleTheme }) => {
  return (
    <button onClick={toggleTheme} className="theme-toggle">
      {theme === 'light' ? 'D' : 'L'}
    </button>
  );
};

export default ThemeToggle;
