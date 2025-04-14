// // server.ts
// import express, { Request, Response, NextFunction } from 'express';
// import next from 'next';
// import path from 'path';
// import { createProxyMiddleware, responseInterceptor } from 'http-proxy-middleware';
// import { fileURLToPath } from 'url';

// const PORT = process.env.PORT || 3000;
// const dev = process.env.NODE_ENV !== 'production';

// // Create __dirname in an ESM context.
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Initialize Next.js
// const app = next({ dev });
// const handle = app.getRequestHandler();

// app.prepare().then(() => {
//   const server = express();

//   // 1. Set global COOP/COEP/CRP headers on every response.
//   server.use((req: Request, res: Response, next: NextFunction) => {
//     res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
//     res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
//     res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
//     next();
//   });

//   // 2. Set up the proxy route for the game assets.
//   const proxyOptions = {
//     target: 'https://www.trygameplay.com',
//     changeOrigin: true,
//     pathRewrite: (originalPath: string, req: Request) => {
//       const rewritten = originalPath.replace(
//         /^\/game/,
//         '/api/proxy/game/dea9fff4-2e4c-4e1f-99c4-a19f891304df/'
//       );
//       console.log(`[Proxy] ${req.method} ${originalPath} -> ${rewritten}`);
//       return rewritten;
//     },
//     selfHandleResponse: true,
//     onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
//       // Add the COOP/COEP headers to the proxied response.
//       res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
//       res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
//       res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
//       return responseBuffer;
//     }),
//   };

//   // Cast proxy middleware as any if needed to bypass TS errors.
//   const proxyMiddleware = createProxyMiddleware(proxyOptions) as any;
//   server.use('/game', proxyMiddleware);

//   // 3. Serve static files from the public folder.
//   server.use(express.static(path.join(__dirname, 'public')));

//   // 4. Delegate all remaining routes to Next.js.
//   server.all('*', (req, res) => handle(req, res));

//   // 5. Start the server.
//   server.listen(PORT, () => {
//     console.log(`✅ Server running at http://localhost:${PORT}`);
//   });
// });
