# Mochi — public research guide

The frontend is a small, buildless module on GitHub Pages. A Cloudflare Worker
calls Groq; API keys never enter the browser or repository. Only information
already published on the homepage and its public measurement notes belongs in
`knowledge.mjs`. Do not import private CVs or unpublished manuscripts.

## Deploy the backend

The manually triggered **Deploy research chatbot** GitHub Actions workflow uses
Node 22 and the locked Wrangler dependency. It only deploys from `main`. Add
these repository Secrets under Settings → Secrets and variables → Actions:

| Repository Secret | Purpose |
| --- | --- |
| `RESUME` | Groq API key; mapped to the Worker's `GROQ_API_KEY` secret |
| `CLOUDFLARE_ACCOUNT_ID` | The account that owns the Worker |
| `CLOUDFLARE_API_TOKEN` | Scoped authorization to deploy Workers in that account |

The workflow checks Groq authorization, preserves an existing `workers.dev`
subdomain (or registers `chenghaoliu519` when none exists), deploys the Worker,
and writes its secret through stdin. It prints only the public endpoint and
deployment status. A subdomain collision requires choosing another available
subdomain in the Cloudflare dashboard before rerunning.

Put the resulting `https://chenghao-mochi.<subdomain>.workers.dev/chat` URL in
`config.mjs`, and permit that exact origin in the homepage's `connect-src` CSP.
Verify a real answer before publishing the frontend. Do not use a wildcard
origin or place any secret in the client configuration.

## Behavior and limits

- The assistant answers in English or Chinese from approved public facts. It
  speaks about Chenghao in the third person and cannot act on his behalf.
- The current language is saved as `chenghao-guide-language` in local storage;
  language switching still works when storage is unavailable. Answers have a
  copy control, with text selection as a fallback if clipboard access fails.
  On mobile, the welcome panel fits its content and expands for conversation.
- Only the question and up to four previous visitor questions are sent to the
  backend. Conversation state stays in the tab; no conversation persistence or
  conversation database is used. The UI discloses transmission to Groq.
- The Worker does not log message content. Cloudflare and Groq process requests
  under their own policies. Do not describe this as zero-retention or local AI.
- Replies are rendered as text, and related source links are selected from the
  site's public topic index, never from model-generated URLs.
  Grounding instructions reduce hallucinations; they do not guarantee factual
  accuracy. Check answers when updating the model or knowledge.
- Requests are limited to 500 characters and 8 KB bodies, with a 14-second
  upstream timeout. Only the production homepage origin is allowed by CORS.
  CORS is not authentication for a public endpoint.
- Cloudflare rate bindings impose approximate limits of 6 requests per IP and
  10 site requests per minute **per Cloudflare location**. Shared IPs may share
  the limit. These are not a strict worldwide quota or billing cap.
- Stay on Groq's Free plan if free-only operation is required; its model/token
  limits still apply. Upgrading the provider account may incur charges.
- A network/provider/quota failure uses a clearly labelled curated answer,
  never a simulated AI response. A 429 pauses new model calls in the tab for
  one minute. Empty endpoint configuration also uses curated answers.

## Verify and maintain

With Node 22 or later, run `npm ci && npm test` here. Browser checks should cover
the modal, keyboard focus, Chinese input composition, mobile layouts, safe text
rendering, source links, and quota fallback. Test Groq on public questions only.
`GET /health` reports deployment/configuration health, not model availability.

When changing client modules, refresh their import query hashes and the
`index.html` stylesheet/module hashes. Keep `.dev.vars`, environment files,
Wrangler state, build output and credentials out of Git.

Official references: [Groq text generation](https://console.groq.com/docs/text-chat),
[Groq rate limits](https://console.groq.com/docs/rate-limits),
[Cloudflare rate limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/),
[GitHub Actions deployment](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/).
