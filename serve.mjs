import http from 'http'; import fs from 'fs'; import path from 'path';
import { fileURLToPath } from 'url';
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2','.svg':'image/svg+xml'};
http.createServer((req,res)=>{
  let f=decodeURIComponent(req.url.split('?')[0]); if(f==='/')f='/index.html';
  const fp=path.join(ROOT,f);
  fs.readFile(fp,(e,d)=>{ if(e){res.writeHead(404);return res.end('404');}
    res.writeHead(200,{'Content-Type':types[path.extname(fp)]||'application/octet-stream','Cache-Control':'no-store'});res.end(d);});
}).listen(5173,()=>console.log('Riverstone running at http://127.0.0.1:5173'));
