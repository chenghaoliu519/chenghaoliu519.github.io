// Only information already published on Chenghao's homepage belongs here.
// Keep unpublished manuscripts, the private CV, and credentials out of this file.
export const sources = {
  about: { href: '#about', en: 'About Chenghao', zh: '个人简介' },
  background: { href: '#background', en: 'Background', zh: '教育与经历' },
  research: { href: '#research', en: 'Research interests', zh: '研究方向' },
  spirit: { href: '#publications', en: 'SPIRIT', zh: 'SPIRIT 研究介绍' },
  method: { href: '#spirit-method', en: 'How SPIRIT works', zh: 'SPIRIT 方法详解' },
  results: { href: '#spirit-experiments', en: 'Experimental results', zh: '实验结果' },
  poster: { href: '/assets/figures/spirit-poster-neurips2026.png', en: 'Research poster', zh: '完整研究海报' },
  slides: { href: '/assets/slides/SPIRIT-NeurIPS2026.pdf?v=93ae0f35b67e', en: 'Slides (PDF)', zh: '幻灯片 PDF' },
  slideDeck: { href: '/assets/slides/SPIRIT-NeurIPS2026.pptx?v=eaf328476dee', en: 'Download slides (PPTX)', zh: '下载演示文稿', download: true },
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
    id: "results", sourceIds: ["results","paper"],
    match: /\b(results?|speedup|performance|faster|gain|nf4|fp16|precision|quantiz)\b|结果|加速|性能|收益|精度|量化|多快|2\.48|1\.74/i,
    en: "SPIRIT achieves up to 1.74× speedup with FP16 self-drafts and 2.48× with NF4 self-drafts over autoregressive decoding, with full-target verification. It leads SWIFT and D&V in all nine evaluated LLaMA-2 model–task settings with FP16 drafts. Separate evaluations cover SpecBench, recurring workloads, sustained 1,000-request decoding, Qwen and Mixtral, batching, and HumanEval. The headline values are maxima from their stated settings.",
    zh: "SPIRIT 相对自回归解码，在 FP16 自草稿下最高达到 1.74×，在 NF4 自草稿下最高达到 2.48×，同时保留完整目标模型验证。在九组 LLaMA-2 模型与任务的 FP16 对比中，吞吐量均高于 SWIFT 和 D&V。独立评估还覆盖 SpecBench、循环工作负载、1,000 请求持续解码、Qwen、Mixtral、批量服务和 HumanEval；两个最高值各自对应特定实验条件。"
  },
  {
    id: "measurement", sourceIds: ["results","measurement"],
    match: /\b(protocol|hardware|a6000|1000|1,000|seeds?|cumulative|pooled|reproduc|measurement|measured how)\b|口径|硬件|种子|累计|汇总|合并|复现|怎么测|如何测|两台|2\.14|2\.46/i,
    en: "The independent long-stream study uses LLaMA-2-13B, fused NF4 drafts, full FP16 verification, and the same ordered 1,000-request TinyStories stream on one RTX A6000 per run. Eight historical best-per-seed runs were selected from 27 completed candidates: the best complete run is 2.478× (2.48× at two decimals), while pooled throughput is 2.4646542577× (2.46× at two decimals). Decode timing includes within-run search and profile updates, excluding prefill, loading, setup, and earlier candidate attempts. This is separate from the paired three-task NF4/FP16 study.",
    zh: "独立长序列实验使用 LLaMA-2-13B、融合 NF4 自草稿、完整 FP16 验证器和同序的 1,000 个 TinyStories 请求，每次运行一张 RTX A6000。从 27 个已完成候选中选取八个 seed 各自的历史最佳运行：最佳完整运行是 2.478×，展示为 2.48×；合并吞吐量为 2.4646542577×，直接保留两位小数是 2.46×。解码计时包含本次运行的在线搜索和配置更新，排除 prefill、加载、初始化及此前候选尝试。它与三任务 NF4/FP16 配对实验是两组独立评估。"
  },
  {
    id: 'verification', sourceIds: ['spirit', 'method'],
    match: /\b(verify|verification|verifier|correctness|lossless|exact|quality|training|train|draft model)\b|验证|正确性|无损|质量|训练|草稿模型/i,
    en: 'SPIRIT reuses the target model for self-drafting and retains full-target verification. Layer skipping or lower draft precision changes proposal cost; the full model still verifies the proposals. It needs no training or separately trained draft model. The public summary does not claim bit-for-bit identity for every deployment-precision execution.',
    zh: 'SPIRIT 复用目标模型进行自草稿，并保留完整目标模型验证。跳层或降低草稿精度改变的是候选生成成本，候选仍由完整模型验证。它不需要训练，也不需要单独训练的草稿模型。公开介绍没有承诺所有部署精度下的执行都逐位完全一致。'
  },
  {
    id: "availability", sourceIds: ["paper","poster","slides"],
    match: /\b(download|source code|repository|pdf|arxiv|cv|resume|unpublished|under review)\b|下载|源码|代码|简历|未发表|在投/i,
    en: "The SPIRIT paper, complete poster, and presentation are available beside the publication summary. Slides can be read as a PDF or downloaded as PPTX. The site does not publish a SPIRIT source-code release, full CV, or unpublished manuscripts. For other materials or collaboration, contact liuchenghao97@gmail.com.",
    zh: "SPIRIT 论文、完整海报和演示文稿都可以从主页论文简介旁直接打开；幻灯片支持 PDF 在线查看和 PPTX 下载。网站未发布 SPIRIT 源码、完整简历或未发表稿件；其他材料和合作可联系 liuchenghao97@gmail.com。"
  },
  {
    id: 'contact', sourceIds: ['contact'],
    match: /\b(contact|email|collaborat|reach|hire|recruit|message)\b|联系|邮箱|合作|招聘|找他|发邮件/i,
    en: 'For research conversations and collaboration, email Chenghao at liuchenghao97@gmail.com. His GitHub profile is chenghaoliu519. I’m a site guide, so I cannot send messages or make commitments on his behalf.',
    zh: '科研交流或合作可以发送邮件至 liuchenghao97@gmail.com；他的 GitHub 用户名是 chenghaoliu519。我是网站助手，不能代他发送消息或作出承诺。'
  },
  {
    id: "specbench", sourceIds: ["results","paper"],
    match: /\bspecbench\b|17\.2/i,
    en: "On SpecBench with LLaMA-2-13B and the same self-speculative backend, SPIRIT reaches 1.462× full-stream throughput over AR versus 1.247× for SWIFT, a 17.2% relative increase. This includes online exploration and profile updates. The six post-adaptation task comparisons are a separate summary, reported as three-seed means and standard deviations.",
    zh: "SpecBench 使用 LLaMA-2-13B 和相同的自推测后端，SPIRIT 全流程吞吐量相对 AR 为 1.462×，SWIFT 为 1.247×，因此相对 SWIFT 提高 17.2%。这一口径包含在线探索和配置更新。海报中的六任务图则是适应完成后的另一组统计，误差条为三个 seed 的标准差。"
  },
  {
    id: "reuse_results", sourceIds: ["results","method"],
    match: /(?=[\s\S]*(?:\breuse\b|复用))(?=[\s\S]*(?:\b(?:benefit\w*|gain\w*|speedup|improv\w*|results?|throughput)\b|收益|提升|结果|加速|吞吐))|9\.8|10\.3/i,
    en: "In 600-request FP16 streams that change task every 100 requests, profile reuse improves throughput by 9.8–10.3% over SPIRIT without reuse. On LLaMA-2-13B the speedup over AR rises from 1.43× to 1.57×; on 70B it rises from 1.45× to 1.60×. These are recurring-workload experiments, separate from the stable TinyStories long-stream study.",
    zh: "在每 100 个请求切换任务、共 600 个请求的 FP16 流中，profile reuse 相比不使用复用的 SPIRIT 提高 9.8–10.3% 的吞吐量。LLaMA-2-13B 相对 AR 的加速从 1.43× 提高到 1.57×，70B 从 1.45× 提高到 1.60×。这组循环工作负载实验与稳定 TinyStories 的长序列实验相互独立。"
  },
  {
    id: "precision", sourceIds: ["results","paper"],
    match: /(?=[\s\S]*(?:\bnf4\b|量化))(?=[\s\S]*(?:\b(?:vs|versus|compar\w*|relative|precision)\b|对比|相比|比较|精度))|\bquantiz\w*\b|23\.6|精度对比/i,
    en: "In the separate three-task LLaMA-2-13B precision study, NF4 self-drafts deliver 23.6% higher aggregate throughput than FP16 self-drafts, with a request-paired bootstrap 95% interval of 21.4–26.3%. Overall speedups over AR are 1.981× and 1.603× respectively. Both use the same FP16 verifier, with ratio and layer configurations optimized separately. This comparison does not use the selected 2.48× TinyStories run.",
    zh: "独立的三任务 LLaMA-2-13B 精度实验中，NF4 自草稿相比 FP16 自草稿提高 23.6% 的合并吞吐量，请求配对 bootstrap 的 95% 区间为 21.4–26.3%。两者相对 AR 分别为 1.981× 和 1.603×，使用同一个 FP16 验证器，并分别优化比例和层配置。这个比较不使用所选 TinyStories 运行的 2.48× 结果。"
  },
  {
    id: "materials", sourceIds: ["paper","poster","slides"],
    match: /\b(poster|slides?|presentation|materials?)\b|海报|幻灯|演示文稿|报告材料/i,
    en: "The homepage provides the full paper, complete research poster, and presentation next to the SPIRIT summary. Slides open as a PDF for reading, with a separate PowerPoint download. Research details contain expandable motivation, method, and experimental-results figures.",
    zh: "主页 SPIRIT 简介旁提供完整论文、研究海报和演示文稿入口。幻灯片可以打开 PDF 在线阅读，也有单独的 PowerPoint 下载链接。Research details 中还可分别展开动机图、方法图和实验结果图。"
  },
  {
    id: "slide_download", sourceIds: ["slides","slideDeck"],
    match: /\b(pptx?|powerpoint)\b|下载[\s\S]*(?:幻灯|演示)|(?:幻灯|演示)[\s\S]*下载/i,
    en: "The SPIRIT presentation is available as a PDF for browser viewing and as a PowerPoint file for download. Use Slides (PDF) to read it or Download slides (PPTX) for the presentation file.",
    zh: "SPIRIT 演示文稿提供 PDF 在线阅读版和 PowerPoint 下载版。可以点击 Slides (PDF) 查看，或点击 Download slides (PPTX) 下载演示文件。"
  }
];

export function localAnswer(question, language = 'en') {
  const lang = language === 'zh' ? 'zh' : 'en';
  // More specific topics override broad mentions such as “SPIRIT”.
  const priority = ['contact', 'slide_download', 'materials', 'availability', 'measurement', 'specbench', 'reuse_results', 'precision', 'experience', 'reuse', 'search', 'results', 'objective', 'verification', 'background', 'research', 'spirit'];
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
