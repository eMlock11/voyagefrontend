import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './globals.css'

// Garante que o projeto utilize apenas o padrão visual original
if (typeof window !== 'undefined') {
  document.documentElement.classList.remove('light', 'dark');
  localStorage.removeItem('voyage-theme');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
