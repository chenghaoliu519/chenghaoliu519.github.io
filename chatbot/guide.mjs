import { CHAT_ENDPOINT } from './config.mjs?v=3ecaa7461fe7';
import { localAnswer, sources } from './knowledge.mjs?v=34cd04085862';

const get = id => document.getElementById(`guide-${id}`);
const dialog = get('dialog');
const dock = get('dock');
const launcher = get('launcher');
const input = get('input');
const send = get('send');
const messages = get('messages');
const status = get('status');
const scroll = get('scroll');
const newAnswer = get('new-answer');
const endpoint = /^https:\/\/chenghao-mochi\.[a-z0-9-]+\.workers\.dev\/chat$/.test(CHAT_ENDPOINT) ? CHAT_ENDPOINT : '';
const languageKey = 'chenghao-guide-language';
let language = 'en';
try {
  const saved = localStorage.getItem(languageKey);
  if (saved === 'en' || saved === 'zh') language = saved;
} catch { /* Language switching also works without browser storage. */ }
let history = [];
let pending = null;
let generation = 0;
let cooldownUntil = 0;
let unreadAnswer = null;

const copy = {
  en: {
    subtitle: 'Chenghao’s research guide', greeting: 'A little guide. A closer look.',
    description: 'Hi, I’m Mochi. Ask me about Chenghao’s background, research, or the ideas behind SPIRIT.',
    suggestions: [['His background', 'Tell me about Chenghao’s background.'], ['What is SPIRIT?', 'What is the key idea behind SPIRIT?'], ['Research results', 'What results does SPIRIT achieve?']],
    placeholder: 'Ask a question…', label: 'Your question', send: 'Send question', close: 'Close chat', reset: 'Start a new conversation',
    thinking: 'Looking through the public research notes…', user: 'You', local: 'From the public site · AI is unavailable right now',
    localOnly: 'From the public site', privacy: 'AI answers from public information; may make mistakes. Questions and recent context are sent to Groq. ',
    privacyLocal: 'Answers from the public site. This conversation stays in this tab.', policy: 'Privacy',
    conversation: 'Conversation', suggestionsLabel: 'Suggested questions',
    copyAnswer: 'Copy answer', copied: 'Copied', copySuccess: 'Answer copied.',
    copyFallback: 'Text selected. Copy it manually.',
    minimize: 'Minimize Mochi', restore: 'Show Mochi', newAnswer: 'New answer ↓'
  },
  zh: {
    subtitle: 'Chenghao 的科研小助手', greeting: '小小向导，带你走近研究。',
    description: '你好，我是 Mochi。可以问我 Chenghao 的背景、研究成果，或 SPIRIT 背后的想法。',
    suggestions: [['个人背景', '介绍一下 Chenghao 的个人背景。'], ['SPIRIT 是什么？', 'SPIRIT 的核心想法是什么？'], ['研究成果', 'SPIRIT 取得了哪些加速结果？']],
    placeholder: '聊聊 Chenghao 或 SPIRIT…', label: '你的问题', send: '发送问题', close: '关闭聊天', reset: '开始新的对话',
    thinking: '正在查阅公开研究资料…', user: '你', local: '公开资料回答 · AI 暂时不可用',
    localOnly: '公开资料回答', privacy: 'AI 根据公开资料回答，可能出错。问题与最近的上下文会发送给 Groq。',
    privacyLocal: '根据公开网站资料回答。对话仅保留在此标签页中。', policy: '隐私说明',
    conversation: '对话记录', suggestionsLabel: '建议问题',
    copyAnswer: '复制回答', copied: '已复制', copySuccess: '回答已复制。',
    copyFallback: '已选中文字，请手动复制。',
    minimize: '收起 Mochi', restore: '显示 Mochi', newAnswer: '新回答 ↓'
  }
};

function setLanguage(next) {
  language = next;
  try { localStorage.setItem(languageKey, language); } catch { /* Keep this tab's choice. */ }
  updateLanguage();
}

function updateLanguage() {
  const t = copy[language];
  dialog.lang = language === 'zh' ? 'zh-CN' : 'en';
  for (const key of ['subtitle', 'greeting', 'description']) get(key).textContent = t[key];
  input.placeholder = t.placeholder;
  get('input-label').textContent = t.label;
  for (const key of ['send', 'close', 'reset']) get(key).setAttribute('aria-label', t[key]);
  get('reset').title = t.reset;
  for (const key of ['minimize', 'restore']) {
    get(key).setAttribute('aria-label', t[key]); get(key).title = t[key];
  }
  newAnswer.textContent = t.newAnswer;
  get('language').textContent = language === 'en' ? '中文' : 'EN';
  get('language').setAttribute('aria-label', language === 'en' ? 'Switch to Chinese' : 'Switch to English');
  messages.setAttribute('aria-label', t.conversation);
  const suggestions = get('suggestions');
  suggestions.setAttribute('aria-label', t.suggestionsLabel);
  suggestions.replaceChildren();
  for (const [label, question] of t.suggestions) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', () => submit(question));
    suggestions.append(button);
  }
  const privacy = get('privacy');
  privacy.textContent = endpoint ? t.privacy : t.privacyLocal;
  if (endpoint) {
    const link = document.createElement('a');
    link.href = 'https://console.groq.com/docs/your-data';
    link.target = '_blank'; link.rel = 'noopener noreferrer';
    link.textContent = t.policy;
    privacy.append(link);
  }
}

function open() {
  dialog.showModal();
  document.documentElement.classList.add('guide-is-open');
  resizeInput();
}
function close() { dialog.close(); }
launcher.addEventListener('click', open);
get('minimize').addEventListener('click', () => {
  dock.dataset.minimized = '';
  get('restore').focus({ preventScroll: true });
});
get('restore').addEventListener('click', () => {
  delete dock.dataset.minimized;
  launcher.focus({ preventScroll: true });
});
get('close').addEventListener('click', close);
dialog.addEventListener('close', () => {
  document.documentElement.classList.remove('guide-is-open');
  launcher.focus({ preventScroll: true });
});
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const r = dialog.getBoundingClientRect();
  if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) close();
});
get('language').addEventListener('click', () => {
  setLanguage(language === 'en' ? 'zh' : 'en');
});
get('reset').addEventListener('click', () => {
  generation++; pending?.abort(); pending = null; history = [];
  messages.replaceChildren(); status.textContent = ''; input.value = '';
  unreadAnswer = null; newAnswer.hidden = true; resizeInput();
  dialog.classList.remove('has-conversation');
  get('intro').hidden = false; updateControls(); scroll.scrollTop = 0;
});

function updateControls() {
  send.disabled = Boolean(pending) || !input.value.trim();
  input.setAttribute('aria-busy', pending ? 'true' : 'false');
}
function resizeInput() {
  if (!dialog.open) return;
  input.rows = 1;
  if (input.scrollHeight > input.clientHeight + 1) {
    const style = getComputedStyle(input);
    const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    input.rows = Math.min(4, Math.ceil((input.scrollHeight - padding) / parseFloat(style.lineHeight)));
  }
}
input.addEventListener('input', () => { updateControls(); resizeInput(); });
window.addEventListener('resize', resizeInput);
input.addEventListener('keydown', event => {
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing && event.keyCode !== 229) {
    event.preventDefault();
    if (!pending) submit(input.value);
  }
});
get('form').addEventListener('submit', event => { event.preventDefault(); submit(input.value); });

function scrollToLatest() {
  scroll.scrollTo({ top: scroll.scrollHeight, behavior: 'instant' });
}

function revealAnswer(answer, focus = false) {
  unreadAnswer = null; newAnswer.hidden = true;
  const top = scroll.scrollTop + answer.getBoundingClientRect().top - scroll.getBoundingClientRect().top;
  scroll.scrollTo({ top: top - parseFloat(getComputedStyle(scroll).paddingTop), behavior: 'instant' });
  if (focus) {
    answer.tabIndex = -1; answer.focus({ preventScroll: true });
    answer.addEventListener('blur', () => answer.removeAttribute('tabindex'), { once: true });
  }
}

newAnswer.addEventListener('click', () => {
  if (unreadAnswer?.isConnected) revealAnswer(unreadAnswer, true);
});
scroll.addEventListener('scroll', () => {
  if (!unreadAnswer || !dialog.open) return;
  const answer = unreadAnswer.getBoundingClientRect();
  const viewport = scroll.getBoundingClientRect();
  if (answer.top < viewport.bottom && answer.bottom > viewport.top) {
    unreadAnswer = null; newAnswer.hidden = true;
  }
}, { passive: true });

function addCopyControl(item, content, text, t) {
  const actions = document.createElement('div');
  actions.className = 'guide-answer-actions';
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'guide-copy'; button.textContent = t.copyAnswer;
  const feedback = document.createElement('span');
  feedback.className = 'guide-copy-feedback'; feedback.setAttribute('role', 'status');
  let resetTimer;
  button.addEventListener('click', async () => {
    clearTimeout(resetTimer);
    button.disabled = true;
    feedback.textContent = '';
    try {
      if (!navigator.clipboard?.writeText) throw new Error('unavailable');
      await navigator.clipboard.writeText(text);
      button.textContent = t.copied;
      feedback.classList.add('guide-sr-only');
      feedback.textContent = t.copySuccess;
      resetTimer = setTimeout(() => { button.textContent = t.copyAnswer; feedback.textContent = ''; }, 2000);
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(content);
      selection.removeAllRanges(); selection.addRange(range);
      button.textContent = t.copyAnswer;
      feedback.classList.remove('guide-sr-only');
      feedback.textContent = t.copyFallback;
    } finally { button.disabled = false; }
  });
  actions.append(button, feedback); item.append(actions);
}

function appendMessage(role, text, ids = [], mode = '', lang = language) {
  const t = copy[lang];
  const item = document.createElement('div');
  item.className = `guide-message ${role}`;
  item.lang = lang === 'zh' ? 'zh-CN' : 'en';
  const speaker = document.createElement('span');
  speaker.className = 'guide-speaker';
  speaker.textContent = role === 'user' ? t.user : 'Mochi';
  const content = document.createElement('p');
  content.textContent = text;
  item.append(speaker, content);
  if (ids.length) {
    const links = document.createElement('div'); links.className = 'guide-sources';
    for (const id of [...new Set(ids)].slice(0, 3)) {
      const source = sources[id]; if (!source) continue;
      const link = document.createElement('a');
      link.href = source.href; link.textContent = `${source[lang]} ↗`;
      if (source.href.startsWith('#')) {
        link.addEventListener('click', event => {
          event.preventDefault(); close();
          requestAnimationFrame(() => {
            if (id === 'method') document.querySelector('.paper-summary').open = true;
            const target = document.querySelector(source.href);
            if (!target) return;
            target.setAttribute('tabindex', '-1');
            target.focus({ preventScroll: true });
            target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
            target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
          });
        });
      } else { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
      links.append(link);
    }
    item.append(links);
  }
  if (mode === 'local') {
    const note = document.createElement('span'); note.className = 'guide-mode';
    note.textContent = endpoint ? t.local : t.localOnly; item.append(note);
  }
  if (role === 'assistant') addCopyControl(item, content, text, t);
  dialog.classList.add('has-conversation');
  messages.append(item);
  while (messages.children.length > 60) messages.firstElementChild.remove();
  return item;
}

async function submit(raw) {
  const question = raw.trim();
  if (!question || question.length > 500 || pending) return;
  const nextLanguage = /[\u3400-\u9fff]/u.test(question) ? 'zh' : /[a-z]/i.test(question) ? 'en' : language;
  setLanguage(nextLanguage);
  const lang = language;
  const turn = generation;
  get('intro').hidden = true;
  unreadAnswer = null; newAnswer.hidden = true;
  input.value = ''; resizeInput();
  appendMessage('user', question, [], '', lang);
  scrollToLatest();
  let reply = localAnswer(question, lang);
  if (endpoint && Date.now() >= cooldownUntil) {
    const controller = new AbortController(); pending = controller;
    updateControls(); status.textContent = copy[lang].thinking;
    scrollToLatest();
    const timeout = setTimeout(() => controller.abort(), 17000);
    try {
      const response = await fetch(endpoint, {
        method: 'POST', credentials: 'omit', referrerPolicy: 'no-referrer', signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, history: history.slice(-4), language: lang })
      });
      if (response.status === 429) cooldownUntil = Date.now() + 60000;
      if (!response.ok) throw new Error('unavailable');
      const candidate = await response.json();
      if (candidate.mode !== 'ai' || typeof candidate.answer !== 'string' || !candidate.answer.trim() ||
          candidate.answer.length > 2400 || !Array.isArray(candidate.sourceIds) ||
          candidate.sourceIds.some(id => !Object.hasOwn(sources, id))) throw new Error('invalid');
      reply = candidate;
    } catch { /* Keep the explicitly labelled, curated fallback. */ }
    finally { clearTimeout(timeout); if (turn === generation) pending = null; }
  }
  if (turn !== generation) return;
  history.push(question); history = history.slice(-4);
  // Follow a waiting reader to the answer's beginning, but preserve the position
  // of someone who scrolled back through the conversation while it was pending.
  const follow = dialog.open && scroll.scrollHeight - scroll.clientHeight - scroll.scrollTop < 32;
  const previousTop = scroll.scrollTop;
  const viewportTop = scroll.getBoundingClientRect().top;
  const anchor = Array.from(messages.children).find(item => item.getBoundingClientRect().bottom > viewportTop);
  const anchorOffset = anchor ? anchor.getBoundingClientRect().top - viewportTop : 0;
  status.textContent = '';
  const answer = appendMessage('assistant', reply.answer, reply.sourceIds, reply.mode, lang);
  if (follow) revealAnswer(answer);
  else {
    unreadAnswer = answer; newAnswer.hidden = false;
    const top = anchor?.isConnected
      ? scroll.scrollTop + anchor.getBoundingClientRect().top - scroll.getBoundingClientRect().top - anchorOffset
      : previousTop;
    scroll.scrollTo({ top, behavior: 'instant' });
  }
  updateControls();
}

if (typeof dialog.showModal === 'function') { updateLanguage(); dock.hidden = false; }
