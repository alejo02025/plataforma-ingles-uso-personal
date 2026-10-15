import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
const base = '/plataforma-ingles-uso-personal';
http
  .createServer(async (req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://local').pathname);
    if (!pathname.startsWith(base + '/')) {
      res.writeHead(404);
      res.end();
      return;
    }
    const file = path.resolve(
      'out',
      '.' + pathname.slice(base.length) + (pathname.endsWith('/') ? 'index.html' : ''),
    );
    if (!file.startsWith(path.resolve('out') + path.sep)) {
      res.writeHead(400);
      res.end();
      return;
    }
    try {
      const contents = await readFile(file);
      res.setHeader(
        'Content-Type',
        {
          '.html': 'text/html',
          '.js': 'text/javascript',
          '.mjs': 'text/javascript',
          '.css': 'text/css',
          '.wasm': 'application/wasm',
          '.json': 'application/json',
          '.webmanifest': 'application/manifest+json',
          '.png': 'image/png',
          '.svg': 'image/svg+xml',
        }[path.extname(file)] || 'application/octet-stream',
      );
      res.end(contents);
    } catch {
      res.writeHead(404);
      res.end();
    }
  })
  .listen(Number(process.env.STUDY_PREVIEW_PORT || 3200), '127.0.0.1');
