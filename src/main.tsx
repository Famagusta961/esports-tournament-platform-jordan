import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Disable browser scroll restoration at app startup
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

createRoot(document.getElementById("root")!).render(<App />);
