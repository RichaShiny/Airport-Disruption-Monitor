import http from 'node:http';
import {readFile} from 'node:fs/promises';
const cache = new Map();
export async function upstream(url, format = 'json') {
 const saved=cache.get(url); if(saved && Date.now()-saved.at<60000) return saved.data;
 const response=await fetch(url,{signal:AbortSignal.timeout(15000),headers:{'User-Agent':'AviationDashboard/1.0','Accept':format==='json'?'application/json':'application/xml'}});
 if(!response.ok) { const e=new Error(response.status===429?'Provider rate limit reached. Try again later.':'Data provider returned HTTP '+response.status); e.status=502; throw e; }
 const data=format==='json'?await response.json():await response.text(); cache.set(url,{at:Date.now(),data}); return data;
}
export function start(handler) {
 const server=http.createServer(async(req,res)=>{try {
 const url=new URL(req.url,'http://localhost');
 if(url.pathname.startsWith('/api/')) { const data=await handler(url); res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'}); res.end(JSON.stringify(data)); return; }
 const files={'/':'index.html','/app.js':'app.js','/style.css':'style.css'};
 if(!files[url.pathname]) {res.writeHead(404);res.end('Not found');return;}
 const data=await readFile(new URL('./public/'+files[url.pathname],import.meta.url));
 res.writeHead(200,{'Content-Type':url.pathname.endsWith('.js')?'text/javascript':url.pathname.endsWith('.css')?'text/css':'text/html'});res.end(data);
 } catch(error) { res.writeHead(error.status||502,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({error:error.message})); }});
 server.listen(Number(process.env.PORT||3000),'127.0.0.1',()=>console.log('Open http://127.0.0.1:'+server.address().port)); return server;
}
