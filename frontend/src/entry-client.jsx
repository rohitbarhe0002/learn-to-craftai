import { hydrateRoot, createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import App from './App';
import './index.css';

const container = document.getElementById('root');

// Check if we have server-rendered content to hydrate
if (container.innerHTML.trim() !== '' && container.innerHTML !== '<!--app-html-->') {
  // Hydrate server-rendered content
  hydrateRoot(
    container,
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  // Client-side only render (development without SSR)
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

