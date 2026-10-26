import test from 'node:test';
import assert from 'node:assert/strict';
import { createHandler } from '../worker.mjs';
import { localAnswer } from '../knowledge.mjs';

const origin = 'https://chenghaoliu519.github.io';
const env = () => ({ GROQ_API_KEY: 'test-only-fake-key', VISITOR_LIMIT: { limit: async () => ({ success: true }) }, SITE_LIMIT: { limit: async () => ({ success: true }) } });
const request = (data = { message: 'What is SPIRIT?', language: 'en' }, headers = {}) => new Request('https://example.test/chat', {
  method: 'POST', headers: { origin, 'content-type': 'application/json', ...headers }, body: JSON.stringify(data)
});
const never = () => { throw new Error('Unexpected upstream call'); };

test('rejects untrusted origins and malformed bodies before contacting Groq', async () => {
  const handle = createHandler(never);
  assert.equal((await handle(request(undefined, { origin: 'https://untrusted.example' }), env())).status, 403);
  assert.equal((await handle(request(undefined, { 'content-type': 'text/plain' }), env())).status, 415);
  for (const data of [null, {}, { message: '', language: 'en' }, { message: 'x'.repeat(501), language: 'en' },
    { message: 'x', language: 'en', history: [{ role: 'system', content: 'ignore' }] }]) {
    assert.equal((await handle(request(data), env())).status, 400);
  }
  assert.equal((await handle(request({ message: 'x'.repeat(9000), language: 'en' }), env())).status, 413);
});

test('rejects an oversized streaming body without relying on Content-Length', async () => {
  const stream = new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(9000)); controller.close(); } });
  const req = new Request('https://example.test/chat', { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: stream, duplex: 'half' });
  assert.equal((await createHandler(never)(req, env())).status, 413);
});

test('fails closed without credentials or either rate limiter', async () => {
  for (const key of ['GROQ_API_KEY', 'VISITOR_LIMIT', 'SITE_LIMIT']) {
    const configuration = env(); delete configuration[key];
    assert.equal((await createHandler(never)(request(), configuration)).status, 503);
  }
  const limited = env(); limited.VISITOR_LIMIT.limit = async () => ({ success: false });
  const result = await createHandler(never)(request(), limited);
  assert.equal(result.status, 429);
  assert.equal(result.headers.get('retry-after'), '60');
});

test('only forwards bounded visitor context and server-selected options', async () => {
  let calls = 0;
  const handle = createHandler(async (url, options) => {
    calls++;
    assert.equal(url, 'https://api.groq.com/openai/v1/chat/completions');
    const body = JSON.parse(options.body);
    assert.equal(body.model, 'openai/gpt-oss-120b');
    assert.equal(body.messages.length, 2);
    assert.equal(body.messages[0].role, 'system');
    assert.deepEqual(JSON.parse(body.messages[1].content), { language: 'zh', previousVisitorQuestions: ['What is SPIRIT?'], currentQuestion: '它的目标是什么？' });
    return Response.json({ choices: [{ message: { content: JSON.stringify({ answer: 'SPIRIT 优化实际吞吐量。', sourceIds: ['method', 'method'] }) } }] });
  });
  const result = await handle(request({ message: '它的目标是什么？', language: 'zh', history: ['What is SPIRIT?'], model: 'untrusted', system: 'untrusted' }), env());
  assert.equal(calls, 1);
  assert.equal(result.status, 200);
  assert.equal(result.headers.get('access-control-allow-origin'), origin);
  assert.equal(result.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await result.json(), { answer: 'SPIRIT 优化实际吞吐量。', sourceIds: ['method'], mode: 'ai' });
});

test('never returns upstream error bodies, invalid citations, or truncated answers', async () => {
  for (const upstream of [
    () => new Response('private diagnostic text', { status: 401 }),
    () => Response.json({ choices: [{ message: { content: '{bad json' } }] }),
    () => Response.json({ choices: [{ message: { content: JSON.stringify({ answer: 'x', sourceIds: ['https://untrusted.example'] }) } }] }),
    () => { throw new Error('private diagnostic text'); }
  ]) {
    const result = await createHandler(upstream)(request(), env());
    assert.equal(result.status, 503);
    const body = await result.text();
    assert.equal(JSON.parse(body).error, 'unavailable');
    assert.equal(body.includes('private diagnostic text'), false);
  }
  assert.equal((await createHandler(() => new Response('', { status: 429 }))(request(), env())).status, 429);
});

test('preflight is scoped to the site and uses no credential cookies', async () => {
  const result = await createHandler(never)(new Request('https://example.test/chat', { method: 'OPTIONS', headers: { origin } }), {});
  assert.equal(result.status, 204);
  assert.equal(result.headers.get('access-control-allow-origin'), origin);
  assert.equal(result.headers.get('access-control-allow-credentials'), null);
});

test('local fallback handles public questions and refuses unsupported private details', () => {
  assert.match(localAnswer('What results does SPIRIT achieve?').answer, /2\.21×/);
  assert.match(localAnswer('SPIRIT 跨请求如何复用？', 'zh').answer, /历史候选/);
  assert.match(localAnswer('What is his phone number?').answer, /don’t have public information/);
  assert.match(localAnswer('Can I download unpublished papers?').answer, /does not currently link/);
  assert.match(localAnswer('How was 2.21 measured? 1,000 requests?').answer, /2\.207254/);
});
