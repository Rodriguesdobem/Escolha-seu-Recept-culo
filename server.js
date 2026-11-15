/* Servidor estático mínimo para desenvolvimento local.
   Uso: node server.js  →  http://localhost:8137 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8137;
const RAIZ = __dirname;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".json": "application/json",
};

http
  .createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
    let alvo = path.normalize(path.join(RAIZ, urlPath === "/" ? "index.html" : urlPath));

    if (!alvo.startsWith(RAIZ)) {
      res.writeHead(403).end("Acesso negado");
      return;
    }

    fs.readFile(alvo, (err, dados) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Arquivo não encontrado");
        return;
      }
      res.writeHead(200, { "Content-Type": MIME[path.extname(alvo)] || "application/octet-stream" });
      res.end(dados);
    });
  })
  .listen(PORT, () => console.log(`Servidor ativo em http://localhost:${PORT}`));
