// Static server for the Beasy prototype: node tools/serve.mjs [port]
import http from "node:http";import fs from "node:fs";import path from "node:path";import {fileURLToPath} from "node:url";
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),"..","prototype");
const port=+process.argv[2]||5174;
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json"};
http.createServer((q,s)=>{let u=decodeURIComponent(q.url.split("?")[0]);if(u.endsWith("/"))u+="index.html";
  const fp=path.join(root,u);if(!fp.startsWith(root)){s.writeHead(403);return s.end()}
  fs.readFile(fp,(e,d)=>{if(e){s.writeHead(404);return s.end("not found")}s.writeHead(200,{"Content-Type":types[path.extname(fp)]||"application/octet-stream","Cache-Control":"no-store"});s.end(d)})
}).listen(port,"127.0.0.1",()=>console.log("Beasy prototype on http://127.0.0.1:"+port));
