import test from 'node:test';
import assert from 'node:assert/strict';
import { designSinglyReinforcedBeam } from '../server/calculations/beam-flexure.js';
import { respond } from '../server/assistant.js';
import { answerWithModel, modelConfigured } from '../server/config.js';

const sample = { b:300, d:500, fck:20, fy:415, Mu:120 };

test('calculates positive tensile steel and checks neutral-axis limit for a supported beam', () => {
  const r=designSinglyReinforcedBeam(sample);
  assert.equal(r.supported,true);
  assert.ok(r.Ast>0);
  assert.ok(r.xu<r.xuMax);
  assert.equal(r.flexurePass,true);
  assert.ok(Math.abs(r.MuCheck-sample.Mu)<0.02);
});

test('returns an unsupported status when applied moment exceeds singly reinforced capacity', () => {
  const r=designSinglyReinforcedBeam({...sample,Mu:250});
  assert.equal(r.supported,false);
  assert.ok(r.limitingMoment<r.requested);
  assert.equal('Ast' in r,false);
});

test('rejects missing, nonpositive, and unsupported grade inputs', () => {
  assert.throws(()=>designSinglyReinforcedBeam({...sample,d:0}),/positive/);
  assert.throws(()=>designSinglyReinforcedBeam({...sample,fy:550}),/Supported steel grades/);
  assert.throws(()=>designSinglyReinforcedBeam({...sample,b:NaN}),/positive/);
  assert.match(respond({text:'Design a beam'}).text,/provide all five values/);
});

test('assistant does not claim verified clause citations or GATE provenance', () => {
  assert.match(respond({text:'Give me the IS 456 clause and page'}).text,/source document has been supplied or verified/);
  assert.match(respond({text:'Give a GATE previous year question'}).text,/provenance will not be invented/);
});

test('offline assistant gives an RCC concept explanation instead of a generic fallback', () => {
  const r=respond({text:'Explain the difference between working stress and limit state methods'});
  assert.equal(r.kind,'theory');
  assert.match(r.text,/elastic behaviour at service loads/);
});

test('model adapter sends conversation context only from the server configuration', async t => {
  const before={provider:process.env.AI_PROVIDER,key:process.env.AI_API_KEY,model:process.env.AI_MODEL,url:process.env.AI_BASE_URL,fetch:globalThis.fetch};
  t.after(()=>{for(const [k,v] of [['AI_PROVIDER',before.provider],['AI_API_KEY',before.key],['AI_MODEL',before.model],['AI_BASE_URL',before.url]])v===undefined?delete process.env[k]:process.env[k]=v;globalThis.fetch=before.fetch;});
  process.env.AI_PROVIDER='openai-compatible';process.env.AI_API_KEY='test-key';process.env.AI_MODEL='test-model';process.env.AI_BASE_URL='https://provider.invalid/v1';
  assert.equal(modelConfigured(),true);
  globalThis.fetch=async(url,options)=>{assert.equal(url,'https://provider.invalid/v1/chat/completions');assert.equal(options.headers.authorization,'Bearer test-key');const body=JSON.parse(options.body);assert.equal(body.messages.at(-2).content,'previous');assert.equal(body.messages.at(-1).content,'current');return new Response(JSON.stringify({choices:[{message:{content:'A model answer.'}}]}),{status:200,headers:{'content-type':'application/json'}})};
  const result=await answerWithModel({text:'current',mode:'beginner',history:[{role:'user',text:'previous'}]});
  assert.equal(result.text,'A model answer.');
});
