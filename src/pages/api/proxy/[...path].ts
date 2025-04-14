// src/pages/api/proxy/[...path].ts
import type { NextApiRequest, NextApiResponse } from 'next';

const ALLOWED_CLOUD_FRONT_HOST = 'd3m5ww9qfhz0t7.cloudfront.net';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get the catch-all path (e.g. ["game-id", "index.html"])
  const { path } = req.query;
  if (!path) {
    res.status(400).json({ error: 'Missing path parameter' });
    return;
  }

  // Join path segments into one relative path
  const pathArray = Array.isArray(path) ? path : [path];
  const pathJoined = pathArray.join('/');

  // Build external URL
  const externalUrl = `https://${ALLOWED_CLOUD_FRONT_HOST}/${pathJoined}`;

  try {
    // Forward the HTTP method and headers from the client:
    const externalResponse = await fetch(externalUrl, {
      method: req.method,
      // Remove headers that might interfere if needed, or pass them as appropriate.
      headers: req.headers as Record<string, string>,
    });

    // Set the required isolation headers:
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    // Optionally copy external content-type:
    const contentType = externalResponse.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }

    // Forward the response status:
    res.status(externalResponse.status);

    // Send the response data (handling text vs. binary):
    if (
      contentType &&
      (contentType.includes('text') ||
        contentType.includes('json') ||
        contentType.includes('javascript'))
    ) {
      const text = await externalResponse.text();
      res.send(text);
    } else {
      const buffer = Buffer.from(await externalResponse.arrayBuffer());
      res.send(buffer);
    }
  } catch (error) {
    console.error('Error proxying request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
