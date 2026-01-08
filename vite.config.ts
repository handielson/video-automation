import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Plugin to handle API routes in development
function apiPlugin() {
  return {
    name: 'api-handler',
    configureServer(server) {
      server.middlewares.use('/api/antigravity-proxy', async (req, res, next) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', async () => {
            try {
              const { action, payload } = JSON.parse(body);
              console.log(`🤖 Antigravity Proxy: ${action}`, payload);

              // Import and execute the handler
              const handler = await import('./api/antigravity-proxy.js');
              const mockReq = {
                method: 'POST',
                body: { action, payload },
                headers: req.headers
              };
              const mockRes = {
                status: (code) => ({
                  json: (data) => {
                    res.statusCode = code;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data));
                  }
                }),
                json: (data) => {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                }
              };

              await handler.default(mockReq, mockRes);
            } catch (error) {
              console.error('❌ API Error:', error);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: error.message }));
            }
          });
        } else {
          res.statusCode = 405;
          res.end('Method not allowed');
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react(), apiPlugin()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
