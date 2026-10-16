import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { respond } from './assistant.js';
import { syllabus } from './syllabus.js';
import { answerWithModel, loadLocalEnv, modelConfigured, modelStatus } from './config.js';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
loadLocalEnv(root);
const dataDir = path.join(root, 'data');
const dbFile = path.join(dataDir, 'conversations.json');
fs.mkdirSync(dataDir, { recursive: true });
const db = () => fs.existsSync(dbFile) ? JSON.parse(fs.readFileSync(dbFile, 'utf8')) : [];
const save = items => fs.writeFileSync(dbFile, JSON.stringify(items, null, 2));
const mime = { '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json; charset=utf-8' };
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const json = (status, obj) => { res.writeHead(status, {'content-type':'application/json; charset=utf-8'}); res.end(JSON.stringify(obj)); };
  if (req.method === 'GET' && url.pathname === '/api/health') return json(200, { ok:true, app:'StructX AI', ...modelStatus(), hostedMode:process.env.HOSTED_MODE==='true', syllabusUnits:syllabus.length });
  if (req.method === 'GET' && url.pathname === '/api/syllabus') return json(200, syllabus);
  if (req.method === 'GET' && url.pathname === '/api/conversations') return json(200, process.env.HOSTED_MODE==='true' ? [] : db());
  if (req.method === 'DELETE' && url.pathname === '/api/conversations') { if(process.env.HOSTED_MODE==='true')return json(405,{error:'Hosted conversations are stored in this browser.'});save([]); return json(200, { ok:true }); }
  if (req.method === 'POST' && url.pathname === '/api/chat') {
    let body=''; for await (const part of req) body += part;
    try {
      const input = JSON.parse(body);
      if(process.env.HOSTED_MODE==='true'){
        const history=Array.isArray(input.history)?input.history.slice(-12):[];
        let answer=respond({text:input.text,mode:input.mode,context:history});
        // Keep verified numeric calculations and their required-input prompts deterministic;
        // use the model for every other chat turn so common topics do not get canned replies.
        try{if(modelConfigured()&&!['calculation','clarification'].includes(answer.kind))answer=await answerWithModel({text:input.text,mode:input.mode,history});}
        catch(error){answer={kind:'provider-error',text:`I could not get an answer from the configured AI provider. ${error.name==='TimeoutError'?'The request timed out.':error.message} Check the server configuration and try again. No answer was fabricated.`};}
        return json(200,{answer});
      }
      const items = db(); let convo = items.find(c => c.id === input.conversationId);
      if (!convo) { convo={id:randomUUID(),title:String(input.text||'New conversation').slice(0,48),saved:false,messages:[],updatedAt:new Date().toISOString()}; items.unshift(convo); }
      convo.messages.push({role:'user',text:String(input.text||''),at:new Date().toISOString()});
      let answer;
      try {
        answer = respond({text:input.text,mode:input.mode,context:convo.messages});
        if (modelConfigured() && !['calculation','clarification'].includes(answer.kind)) {
          const history = convo.messages.slice(0, -1);
          answer = await answerWithModel({ text:input.text, mode:input.mode, history });
        }
      } catch (error) {
        answer = { kind:'provider-error', text:`I could not get an answer from the configured AI provider. ${error.name === 'TimeoutError' ? 'The request timed out.' : error.message} Check your local .env settings, then try again. No answer was fabricated.` };
      }
      convo.messages.push({role:'assistant',...answer,at:new Date().toISOString()}); convo.updatedAt=new Date().toISOString(); save(items);
      return json(200,{conversation:convo,answer});
    } catch(e) { return json(400,{error:e.message||'Invalid request'}); }
  }
  if (req.method === 'PATCH' && url.pathname.startsWith('/api/conversations/')) {
    if(process.env.HOSTED_MODE==='true')return json(405,{error:'Hosted conversations are stored in this browser.'});
    let body=''; for await (const part of req) body+=part;
    try { const data=JSON.parse(body), items=db(), c=items.find(x=>x.id===url.pathname.split('/').pop()); if(!c)return json(404,{error:'Conversation not found'}); c.saved=Boolean(data.saved);save(items);return json(200,c); } catch(e){return json(400,{error:e.message});}
  }
  if (req.method === 'POST' && url.pathname === '/api/export') {
    let body=''; for await (const part of req) body+=part;
    try { const {text}=JSON.parse(body);res.writeHead(200,{'content-type':'text/plain; charset=utf-8','content-disposition':'attachment; filename="structx-solution.txt"'});return res.end(text); } catch(e){return json(400,{error:e.message});}
  }
  const pathname = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
  const file = path.resolve(root, 'public', `.${pathname}`);
  if (!file.startsWith(path.resolve(root,'public')+path.sep)) return json(403,{error:'Forbidden'});
  fs.readFile(file,(err,contents)=>{if(err){res.writeHead(404);return res.end('Not found');}res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream'});res.end(contents);});
});
const port=Number(process.env.PORT)||4173;
server.listen(port,'0.0.0.0',()=>console.log(`StructX AI listening on port ${port}`));
