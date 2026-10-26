// Run only in the manually triggered GitHub Actions deployment job.
// Credentials remain in environment variables / child-process stdin.
import { spawn } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';

const account = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
const token = process.env.CLOUDFLARE_API_TOKEN?.trim();
const groq = process.env.GROQ_API_KEY?.trim();
if (!account || !/^[a-f0-9]{32}$/i.test(account) || !token || !groq) {
  throw new Error('Check the three repository Secrets: RESUME, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN.');
}
const modelCheck = await fetch('https://api.groq.com/openai/v1/models', {
  headers: { Authorization: `Bearer ${groq}` }, signal: AbortSignal.timeout(20000)
});
if (!modelCheck.ok) throw new Error(`Groq credential check failed (HTTP ${modelCheck.status}). Check that RESUME contains a Groq API key from console.groq.com.`);
const models = await modelCheck.json();
const configuredModel = JSON.parse(readFileSync(new URL('./wrangler.json', import.meta.url), 'utf8')).vars.GROQ_MODEL;
if (!models.data?.some(model => model.id === configuredModel)) throw new Error('The configured Groq model is not available for this API key.');
console.log('Groq credential and model availability verified.');
const base = `https://api.cloudflare.com/client/v4/accounts/${account}/workers/subdomain`;
async function cloudflare(method, body) {
  const res = await fetch(base, {
    method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(20000)
  });
  const payload = await res.json();
  return { status: res.status, ok: payload.success === true, payload };
}
let state = await cloudflare('GET');
if (!state.ok && !state.payload.errors?.some(error => error.code === 10007)) {
  throw new Error(`Cloudflare authorization or account check failed (HTTP ${state.status}; codes ${state.payload.errors?.map(e => e.code).join(',')}).`);
}
let subdomain = state.payload.result?.subdomain;
if (!subdomain) {
  state = await cloudflare('PUT', { subdomain: 'chenghaoliu519' });
  if (!state.ok) throw new Error(`Could not register workers.dev subdomain (HTTP ${state.status}; codes ${state.payload.errors?.map(e => e.code).join(',')}).`);
  subdomain = state.payload.result?.subdomain;
}
if (typeof subdomain !== 'string' || !/^[a-z0-9-]+$/.test(subdomain)) throw new Error('Unexpected Worker subdomain.');

async function wrangler(args, input) {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['node_modules/wrangler/bin/wrangler.js', ...args], {
      stdio: ['pipe', 'inherit', 'inherit'],
      env: { ...process.env, CLOUDFLARE_ACCOUNT_ID: account, CLOUDFLARE_API_TOKEN: token, WRANGLER_SEND_METRICS: 'false', CI: 'true' }
    });
    child.on('error', reject);
    child.on('close', code => code === 0 ? resolve() : reject(new Error(`Wrangler failed (${code}).`)));
    child.stdin.on('error', () => {});
    child.stdin.end(input || '');
  });
}
await wrangler(['deploy']);
await wrangler(['secret', 'put', 'GROQ_API_KEY'], groq);
const url = `https://chenghao-mochi.${subdomain}.workers.dev`;
console.log(`Public chatbot endpoint: ${url}/chat`);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `Worker deployed: ${url}\n\nClient endpoint: \`${url}/chat\`\n`);
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `endpoint=${url}/chat\n`);
