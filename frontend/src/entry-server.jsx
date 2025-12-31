import { renderToString } from 'react-dom/server';
import { StrictMode } from 'react';
import App from './App';

/**
 * Server-side render function
 * Called by the SSR server to render the app to HTML
 */
export function render() {
  const html = renderToString(
    <StrictMode>
      <App />
    </StrictMode>
  );
  
  return { html };
}

