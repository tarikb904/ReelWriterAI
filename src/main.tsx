import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize theme before rendering
const initializeTheme = () => {
  const theme = localStorage.getItem('reelwriter-theme') || 'system';
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const shouldUseDark = theme === 'dark' || (theme === 'system' && systemPrefersDark);
  
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(shouldUseDark ? 'dark' : 'light');
};

initializeTheme();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)