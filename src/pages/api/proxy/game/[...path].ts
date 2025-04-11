// src/pages/api/proxy/game/[...path].ts
import type { NextApiRequest, NextApiResponse } from 'next';

// Optionally use an environment variable for your CloudFront domain.
const CLOUDFRONT_DOMAIN = 'd3m5ww9qfhz0t7.cloudfront.net';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path } = req.query;
  
  if (!path || !Array.isArray(path)) {
    return res.status(400).json({ error: 'No file path specified' });
  }
  
  // Build the target CloudFront URL.
  const targetUrl = `https://${CLOUDFRONT_DOMAIN}/${path.join('/')}`;
  
  try {
    const cloudFrontRes = await fetch(targetUrl);
    
    if (!cloudFrontRes.ok) {
      return res.status(cloudFrontRes.status).json({
        error: `Error fetching file from CloudFront: ${cloudFrontRes.statusText}`,
      });
    }
    
    // Obtain the file as a buffer.
    const buffer = await cloudFrontRes.arrayBuffer();
    
    // Mirror the content type header (if present).
    const contentType = cloudFrontRes.headers.get('content-type') || 'application/octet-stream';
    
    // Optionally, you could copy additional headers here if needed.
    // In any case, set the isolation headers on the response.
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    return res.status(200).send(Buffer.from(buffer));
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
