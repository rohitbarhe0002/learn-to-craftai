import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 5173;

async function createServer() {
  const app = express();

  let vite;
  let template;
  let render;

  if (isProduction) {
    // Production: serve built assets
    app.use(express.static(path.resolve(__dirname, 'dist/client'), { index: false }));
    
    template = fs.readFileSync(path.resolve(__dirname, 'dist/client/index.html'), 'utf-8');
    const serverModule = await import('./dist/server/entry-server.js');
    render = serverModule.render;
  } else {
    // Development: use Vite's dev server with HMR
    const { createServer: createViteServer } = await import('vite');
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    
    app.use(vite.middlewares);
  }

  // SSR handler for all routes
  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;

    try {
      let html;

      if (isProduction) {
        // Production: use pre-built template and render function
        const { html: appHtml } = render();
        html = template
          .replace('<!--app-html-->', appHtml)
          .replace('<!--app-head-->', '');
      } else {
        // Development: transform template and load module on the fly
        template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        
        const { render } = await vite.ssrLoadModule('/src/entry-server.jsx');
        const { html: appHtml } = render();
        
        html = template
          .replace('<!--app-html-->', appHtml)
          .replace('<!--app-head-->', '');
      }

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      if (vite) {
        vite.ssrFixStacktrace(e);
      }
      console.error(e.stack);
      res.status(500).end(e.stack);
    }
  });

  app.listen(PORT, () => {
    console.log(`🚀 SSR Server running at http://localhost:${PORT}`);
    console.log(`🔧 Mode: ${isProduction ? 'production' : 'development'}`);
  });
}

createServer();
