import server from '../dist/server/server.js';

export default async function (req, res) {
  // Bridge Node.js (req, res) to Fetch-based TanStack Start server
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  const url = new URL(req.url, `${protocol}://${host}`);
  
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach(v => headers.append(key, v));
      } else {
        headers.set(key, value);
      }
    }
  }

  // Handle body for non-GET requests
  let body = undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    // Vercel might have already parsed the body, but for SSR we usually want the raw stream
    body = req; 
  }

  const request = new Request(url.toString(), {
    method: req.method,
    headers,
    body,
    // @ts-ignore - Duplex is required for streaming bodies in Node 18+
    duplex: body ? 'half' : undefined
  });

  try {
    const response = await server.fetch(request);
    
    // Copy status and headers back to Node.js response
    res.statusCode = response.status;
    response.headers.forEach((value, key) => {
      // Vercel handles some headers like content-encoding automatically,
      // but it's safe to set most of them.
      res.setHeader(key, value);
    });

    if (response.body) {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }
    res.end();
  } catch (e) {
    console.error('SSR Bridge Error:', e);
    res.statusCode = 500;
    res.end('Internal Server Error: ' + e.message);
  }
}
