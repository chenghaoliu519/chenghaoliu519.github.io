// Only information already published on Chenghao's homepage belongs here.
// Keep unpublished manuscripts, the private CV, and credentials out of this file.
export const sources = {
  about: { href: '#about', en: 'About Chenghao', zh: '个人简介' },
  background: { href: '#background', en: 'Background', zh: '教育与经历' },
  research: { href: '#research', en: 'Research interests', zh: '研究方向' },
  spirit: { href: '#publications', en: 'SPIRIT', zh: 'SPIRIT 研究介绍' },
  method: { href: '#spirit-details', en: 'How SPIRIT works', zh: 'SPIRIT 方法详解' },
  paper: { href: '/assets/papers/NeurIPS2026_SPIRIT_CameraReady.pdf', en: 'SPIRIT paper (PDF)', zh: 'SPIRIT 论文 PDF' },
  contact: { href: '#contact', en: 'Get in touch', zh: '联系方式' },
  measurement: {
    href: '/assets/papers/NeurIPS2026_SPIRIT_CameraReady.pdf#page=24',
    en: 'Measurement context', zh: '实验口径'
  }
};

export const facts = [
  {
    id: 'background', sourceIds: ['about', 'background'],
    match: /\b(chenghao|background|education|university|degree|phd|ph\.d|advisor|jia rao|usc|uta)\b|背景|教育|学历|导师|大学|简介|他是谁|介绍一下他/i,
    en: 'Chenghao Liu is a Computer Science Ph.D. student at The University of Texas at Arlington (2024–present), advised by Prof. Jia Rao. He earned an M.S. in Computer Science at the University of Southern California (2020–2023) and a B.Eng. in Computer Science at Wuhan University of Technology (2016–2020).',
    zh: 'Chenghao Liu 是德克萨斯大学阿灵顿分校的计算机科学博士生（2024 年至今），导师为 Jia Rao 教授。他此前在南加州大学获得计算机科学硕士学位（2020–2023），在武汉理工大学获得计算机科学学士学位（2016–2020）。'
  },
  {
    id: 'experience', sourceIds: ['background'],
    match: /\b(internship|intern|experience|clinical|reviewer|peking)\b|实习|经历|北大|临床|审稿人/i,
    en: 'From July to December 2021, Chenghao was an NLP Algorithm Engineer Intern at the Advanced Institute of Information Technology, Peking University. He developed transformer-based models for clinical entity and relation extraction and a personalized reviewer–paper matching system.',
    zh: '2021 年 7–12 月，Chenghao 在北京大学信息技术高等研究院担任 NLP 算法工程师实习生，开发了基于 Transformer 的临床实体与关系抽取模型，并设计了个性化的审稿人–论文匹配系统。'
  },
  {
    id: 'research', sourceIds: ['research'],
    match: /\b(research|interests|memory|kv|cxl|gpu|diffusion|systems)\b|研究方向|兴趣|内存|显存|缓存|数据搬运|扩散/i,
    en: 'His research connects efficient language-model inference, systems-aware optimization, and memory systems for AI. He studies speculative decoding and adaptive computation, runtime feedback under changing workloads, and KV-cache/data movement across GPU and pooled-memory systems.',
    zh: '他的研究关注高效语言模型推理、面向系统的优化和 AI 内存系统，包括推测解码与自适应计算、工作负载变化下的运行时反馈，以及 GPU 和池化内存系统中的 KV cache 与数据搬运。'
  },
  {
    id: 'spirit', sourceIds: ['spirit', 'method'],
    match: /\b(spirit|paper|publication|neurips|speculative|idea|contribution)\b|论文|成果|推测解码|核心|创新/i,
    en: 'SPIRIT: Speed-Driven Online Adaptation for Self-Speculative Decoding is Chenghao’s first-author paper accepted at NeurIPS 2026. It uses the target model itself to draft tokens with selected layers skipped, then verifies them with the full target. Its online controller optimizes window-level realized throughput, adapting the skip ratio and layer pattern without training a separate draft model.',
    zh: 'SPIRIT: Speed-Driven Online Adaptation for Self-Speculative Decoding 是 Chenghao 的第一作者论文，已被 NeurIPS 2026 录用。它通过跳过部分层，让目标模型自身生成草稿，再由完整目标模型验证。在线控制器以窗口级实际吞吐量为目标，自适应调整跳层比例和层配置，无需训练独立的草稿模型。'
  },
  {
    id: 'objective', sourceIds: ['method'],
    match: /\b(objective|throughput|agreement|acceptance|formula|tokens per|signal|ema|feedback)\b|目标函数|吞吐|一致率|接受率|公式|反馈|信号/i,
    en: 'SPIRIT optimizes useful output per second: S_w = G_w / T_w = (α_w + β_w)ν_w. G_w counts committed tokens and T_w measures decoding time. A more accurate draft can still be slower if it costs too much to execute. Length correction and exponential smoothing turn measured throughput into the controller score Q_w; window-boundary updates use statistics from ordinary decoding.',
    zh: 'SPIRIT 优化每秒真正提交的输出：S_w = G_w / T_w = (α_w + β_w)ν_w，其中 G_w 是提交的 token 数，T_w 是解码时间。草稿更准确并不必然更快，因为执行成本也会变化。它对实测吞吐量进行长度校正和指数平滑，得到控制信号 Q_w；窗口边界的更新使用正常解码过程中的统计量。'
  },
  {
    id: 'search', sourceIds: ['method'],
    match: /\b(ratio|layer|search|hierarch|configuration|pattern)\b|比例|跳层|层配置|层模式|搜索|分层/i,
    en: 'SPIRIT searches hierarchically within a request. It first localizes a promising skip-ratio region, then refines which layers are skipped at the selected ratio. The ratio controls how much computation is removed; the layer pattern controls where it is removed. Both are judged by realized throughput feedback.',
    zh: 'SPIRIT 在请求内进行分层搜索：先定位高吞吐的跳层比例区域，再在选定比例下细化具体跳过哪些层。比例决定减少多少计算，层配置决定从哪里减少计算；两者都由实际吞吐量反馈来评价。'
  },
  {
    id: 'reuse', sourceIds: ['method'],
    match: /\b(reuse|shift|profile bank|across requests|restart|switch|mismatch|historical)\b|复用|跨请求|漂移|历史|重启|切换/i,
    en: 'Across requests, SPIRIT keeps a bank of ratio/layer profiles and request-head signatures. When current throughput and acceptance no longer match a stored signature, it probes the active profile and a few historical candidates on the same request head. It can stay, switch, switch and refine, or restart search when none fits.',
    zh: '跨请求时，SPIRIT 保存比例、层配置及请求开头的统计特征。当当前吞吐量和接受率与已有特征不再匹配时，它在同一请求开头比较当前配置与少量历史候选，选择继续使用、切换、切换后细化，或在没有合适配置时重新搜索。'
  },
  {
    id: 'results', sourceIds: ['spirit', 'paper'],
    match: /\b(results?|speedup|performance|faster|gain|nf4|fp16|precision|quantiz)\b|结果|加速|性能|收益|精度|量化|多快|2\.48|1\.74/i,
    en: 'SPIRIT achieves up to 1.74× speedup with FP16 self-drafts and 2.48× with NF4 self-drafts over autoregressive decoding, while retaining full-target verification. Broader evaluations cover LLaMA, Qwen, and Mixtral models, all six SpecBench workloads, and batched serving. These are measured results, not a guarantee for every model or workload.',
    zh: 'SPIRIT 相对自回归解码，在 FP16 自草稿下最高达到 1.74× 加速，在 NF4 自草稿下最高达到 2.48×，同时保留完整目标模型验证。扩展评估覆盖 LLaMA、Qwen、Mixtral、SpecBench 的全部六类任务和批量服务。这些是实测结果，并非所有模型和任务都达到同一加速比。'
  },
  {
    id: 'measurement', sourceIds: ['measurement'],
    match: /\b(protocol|hardware|a6000|1000|1,000|seeds?|cumulative|2\.14|reproduc|measurement|measured how)\b|口径|硬件|种子|累计|复现|怎么测|如何测|两台/i,
    en: 'The camera-ready paper reports up to 2.48× decode speedup with NF4 self-drafts. Appendix C.7 uses LLaMA-2-13B on the same ordered stream of 1,000 TinyStories requests, one RTX A6000 per run, an NF4 draft, and a full FP16 verifier. It reports 2.465× pooled across eight runs and 2.478× for the best complete run, rounded to 2.48×. Timing excludes prefill and includes online search and profile updates; the maximum is not the pooled result.',
    zh: 'Camera-ready 论文报告 NF4 自草稿下最高 2.48× 的 decode 加速。附录 C.7 使用 LLaMA-2-13B、同序的 1,000 个 TinyStories 请求、每次一张 RTX A6000，以及 NF4 草稿和完整 FP16 验证器。论文报告八次运行合并为 2.465×，最好完整运行为 2.478×，四舍五入为 2.48×。计时排除 prefill，包含在线搜索和配置更新；最高值不等于合并结果。'
  },
  {
    id: 'verification', sourceIds: ['spirit', 'method'],
    match: /\b(verify|verification|verifier|correctness|lossless|exact|quality|training|train|draft model)\b|验证|正确性|无损|质量|训练|草稿模型/i,
    en: 'SPIRIT reuses the target model for self-drafting and retains full-target verification. Layer skipping or lower draft precision changes proposal cost; the full model still verifies the proposals. It needs no training or separately trained draft model. The public summary does not claim bit-for-bit identity for every deployment-precision execution.',
    zh: 'SPIRIT 复用目标模型进行自草稿，并保留完整目标模型验证。跳层或降低草稿精度改变的是候选生成成本，候选仍由完整模型验证。它不需要训练，也不需要单独训练的草稿模型。公开介绍没有承诺所有部署精度下的执行都逐位完全一致。'
  },
  {
    id: 'availability', sourceIds: ['paper', 'contact'],
    match: /\b(download|source code|repository|pdf|arxiv|cv|resume|unpublished|under review)\b|下载|源码|代码|简历|未发表|在投/i,
    en: 'The SPIRIT camera-ready paper is available from the homepage’s Read the paper link and the PDF source below. The research details also link the motivation and method figures. The site does not publish a source-code release, full CV, or unpublished manuscripts. For other materials or collaboration, contact liuchenghao97@gmail.com.',
    zh: 'SPIRIT 的 camera-ready 论文已公开，可以点击主页的 Read the paper 或下方 PDF 来源链接。研究详情还提供动机图和方法图。网站未发布源码、完整简历或未发表稿件；其他材料和合作可联系 liuchenghao97@gmail.com。'
  },
  {
    id: 'contact', sourceIds: ['contact'],
    match: /\b(contact|email|collaborat|reach|hire|recruit|available|message)\b|联系|邮箱|合作|招聘|找他|发邮件/i,
    en: 'For research conversations and collaboration, email Chenghao at liuchenghao97@gmail.com. His GitHub profile is chenghaoliu519. I’m a site guide, so I cannot send messages or make commitments on his behalf.',
    zh: '科研交流或合作可以发送邮件至 liuchenghao97@gmail.com；他的 GitHub 用户名是 chenghaoliu519。我是网站助手，不能代他发送消息或作出承诺。'
  }
];

export function localAnswer(question, language = 'en') {
  const lang = language === 'zh' ? 'zh' : 'en';
  // More specific topics override broad mentions such as “SPIRIT”.
  const priority = ['contact', 'availability', 'measurement', 'experience', 'reuse', 'search', 'results', 'objective', 'verification', 'background', 'research', 'spirit'];
  const fact = priority.map(id => facts.find(item => item.id === id)).find(item => item.match.test(question));
  if (fact) return { answer: fact[lang], sourceIds: fact.sourceIds, mode: 'local' };
  return {
    answer: lang === 'zh'
      ? '我可以介绍 Chenghao 的公开背景、研究方向和 SPIRIT。这部分内容在公开资料中没有说明；需要进一步了解时，可以通过主页邮箱联系他。'
      : 'I can help with Chenghao’s public background, research interests, and SPIRIT. I don’t have public information to answer that question. For anything beyond the site, you can contact him by email.',
    sourceIds: ['about', 'contact'], mode: 'local'
  };
}

export const publicKnowledge = facts.map(({ id, en, sourceIds }) => ({ id, text: en, sourceIds }));
