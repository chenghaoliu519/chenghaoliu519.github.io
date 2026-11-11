# Chenghao Liu — Academic homepage

A lightweight, responsive academic homepage for GitHub Pages.

**Website:** https://chenghaoliu519.github.io/

## Files

- `index.html`: biography, research areas, publication, background, and contact.
- `styles.css`: responsive layout, typography, and print styles.
- `theme.css` and `theme.js`: shared light/dark palettes and the accessible
  navigation toggle, including diagram and chat colors.
- `site.js`: optional email-copy control, navigation highlighting, and a bottom
  close control for the research details.
- `chatbot/`: Mochi's bilingual public-knowledge guide, optional Groq-backed
  Cloudflare Worker, tests, and deployment instructions.
- `assets/mochi.svg`: the small vector cat used by the guide.
- `assets/favicon.svg`: vector favicon.
- `assets/social-card.svg` and `assets/social-card.png`: editable source and
  1200 × 630 sharing image, referenced by Open Graph and Twitter card metadata.
- `assets/fonts/`: self-hosted DM Sans and Instrument Serif fonts, with their
  SIL Open Font License files.
- `404.html`: not-found page.
- `robots.txt` and `sitemap.xml`: search-engine discovery.

No framework, build step, package installation, remote fonts, analytics,
or third-party scripts are required. The main content, links, and expandable
publication summary work without JavaScript.

The optional chat uses a separate Cloudflare Worker and Groq. Its keys are kept
in GitHub Actions / Worker secrets, never in site assets. It only receives the
visitor's question and up to three recent question-and-answer pairs, and answers
from public profile information. The chat discloses the external processing and labels curated
fallback answers when the model is unavailable. See [chatbot setup](chatbot/README.md).

The public contact address is `liuchenghao97@gmail.com`. Update both `mailto:`
links and the visible address in `index.html` when changing it; the copy button
reads the address directly from the contact link.

## Local preview

From the repository directory:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000`.

## Publishing

GitHub Pages publishes the root of the `main` branch. `.nojekyll` ensures the
files are served as a plain static site. Push changes to `main` to update it.

When changing `styles.css`, update the stylesheet query in `index.html` and
`404.html` to the first 12 characters of its SHA-256 hash. This keeps new HTML
from being paired with a cached stylesheet from a previous layout.
Apply the same rule to the script query in `index.html` when changing `site.js`.
Refresh the `theme.css` and `theme.js` queries in both HTML pages when changing
them, and the `chatbot/guide.css` and `chatbot/guide.mjs` queries in `index.html`
when changing the chat interface.

## Appearance

The navigation's moon/sun button switches between light and dark mode. A first
visit always uses the light theme; a manual choice is saved under
`chenghao-theme` in browser local storage and synchronized across tabs. The
small external theme script runs before styles paint and follows the existing
CSP. If storage is unavailable, the toggle still works for the current tab.
Without JavaScript, the CSS uses the light theme. The 404 page shares
the theme, while print output always uses the light palette.

Palette values live in `theme.css`. Diagrams use the same CSS variables as the page rather than an
inversion filter. Mochi's artwork retains its original colors on themed panels.

## Content scope

This public repository contains only the website. It intentionally excludes
the full CV, private manuscripts, raw experimental records, research
source code, phone numbers, and personal photographs. Do not copy private
project archives or credentials into this repository.

The author-provided NeurIPS 2026 camera-ready is published at
`assets/papers/NeurIPS2026_SPIRIT_CameraReady.pdf`. The homepage links it directly beside the publication summary.
The three approved poster figures appear as independently expandable parts of
the Problem, Method, and Experiments panels, behind compact “More detail”
controls with full-size links. The method figure sits inside the method canvas
after the two control loops. The assets are `assets/figures/spirit-motivation-v06.png`,
`assets/figures/spirit-method-v32.png`, and `assets/figures/spirit-results-v23.png`.
These are exact copies of the supplied versions; keep future replacements
versioned. The separate method-flow PDF is published at
`assets/papers/spirit_flow.pdf` and linked in the method caption as “control-flow
diagram (PDF).”

The publication summary and Experiments panel both link the author-supplied
complete poster at `assets/figures/spirit-poster-neurips2026.png` and the presentation
PDF at `assets/slides/SPIRIT-NeurIPS2026.pdf`. These are exact source copies of the
supplied exports. The presentation link carries a content hash to refresh updated exports. The latest supplied `results/results.png`
is byte-identical to the versioned V23 figure already used for the results
disclosure. The poster and presentation confirm the comparison scopes and
broader HumanEval, architecture, and batching evaluations.

The headline 2.48× is the camera-ready's NF4 maximum. Appendix C.7 reports
2.478× for the best complete run (rounded to 2.48×), and 2.465× pooled across
eight runs. It uses LLaMA-2-13B, an NF4 self-draft, a full FP16 verifier, and
the same ordered 1,000-request TinyStories stream on one RTX A6000 per run.
Timing excludes prefill and includes online search and profile updates.
Keep the maximum distinct from the pooled result and the older supplementary
2.21× headline. The FP16 maximum remains 1.74×.
The publication headline explicitly labels NF4 self-drafting and the best
1,000-request run; Google Scholar is available in the introductory links.

The V23 results copy is checked against its supplied data and provenance:
SPIRIT leads SWIFT and D&V in all nine Table 1 settings. SpecBench's +17.2%
compares full-stream throughput (1.462 / 1.247), including online exploration
and updates; it is separate from the six post-adaptation task means. Reuse adds
9.8–10.3% over the no-reuse variant in two 600-request streams, each changing
tasks every 100 requests.

The sustained NF4 result pools eight historical best-per-seed local runs from
27 completed candidates. The raw pooled speedup is 2.4646542576762034,
displayed as 2.46× directly from the unrounded value. Earlier candidate attempts
are excluded from each selected run's decode timing. The poster's author-reported
“eight runs per seed” describes additional experiment scale; its displayed
curves and pooled statistic still use eight selected local records, one per seed.

The +23.6% NF4/FP16 throughput ratio and 95% CI of +21.4–26.3% come from the
separate three-task LLaMA-2-13B comparison (Table 5). Both variants keep the
same FP16 verifier and optimize configurations separately. This comparison
must not be derived from, or pooled with, the selected TinyStories trajectories.

The motivation table comes from the V06 figure's fixed-configuration sweep:
LLaMA-2-13B, CNN/DM, FP16, 21 skip ratios × 24 patterns, and the same 24 prompts
per configuration. The highest-acceptance configuration has 99.406% acceptance
and 24.358953 tokens/s; the highest-throughput configuration has 98.020%
acceptance and 26.394627 tokens/s. The highlighted approximately 96–98%
acceptance band spans 21.987234–26.394627 tokens/s. This is an observed band
selected in the sweep, not a confidence interval or an online SPIRIT speedup.
The page rounds these numbers for display.

## Presentation

The acceptance announcement is temporarily hidden. To show it again, remove
the `hidden` attribute from `<a class="announcement">` in `index.html`; update
its text as appropriate. It occupies no space while hidden. The publication's
venue and status remain visible independently.

The introduction stays left-aligned. The publication pairs its title and short
description with a compact conceptual diagram on desktop, stacking them on
mobile. The header contains navigation only; the publication omits the author
row. Native expandable research details contain the full summary, formula, and
control diagram; the three figure disclosures and two method-detail disclosures
also work without JavaScript. The default diagram introduces
self-drafting, full verification, and throughput-guided ratio/layer adaptation.
The expanded diagram adds calibrated feedback, ratio-first search, and profile
reuse. The default Method view keeps the throughput equation, a compact
Measure / Calibrate / Search sequence, and the request-head reuse overview.
“Search details” and “Profile reuse details” start closed and retain the full
diagrams and algorithm steps for readers who expand them. The within-request loop shows token proposals, full-target verification,
committed output and timing; names length correction and EMA smoothing between
the measured throughput and controller score; and separates ratio localization
from layer-pattern refinement at a fixed ratio. Labels stay readable HTML rather
than shrinking with the vector artwork on small screens.
The cross-request diagram compares current head statistics with a stored
signature, shows active and historical ratio/layer configurations, and labels
the stay/switch/refine/restart choices. Historical profiles are probed on the
same request head only when mismatch rises. This diagram uses responsive HTML
labels and vector connectors so its meaning stays readable on narrow screens.
Research details use compact text tabs, generous spacing, and the same unboxed
background as the article. Each topic begins with a clear heading. Problem
explanations and measured evidence share two columns on wide screens; a fine
rule separates them. The method and experiment panels use the same heading
hierarchy and quiet dividers. Existing FP16/NF4 maxima remain paired metrics.
The expanded details offer Problem, Method, and Experiments tabs. Only one panel
is visible at a time, with Problem selected initially. Within-request search and
cross-request profile reuse are both part of Method. The Experiments panel pairs
the FP16/NF4 peak metrics with four concise findings: coverage across models and
tasks, reuse under workload shifts, sustained 1,000-request decoding, and the
separate draft-precision comparison. Findings use an unboxed two-column layout
that stacks on mobile. The complete V23 results poster is collapsed initially.
The throughput formula defines α, β, and ν directly beside the equation; ν uses
total decode time. Research details start closed on page entry, reload, and
return from the browser’s back/forward cache. Tab changes do not alter the URL;
stale research fragments are cleared on entry to avoid automatic expansion.
Tabs support arrow keys and Home/End and stay available while reading long panels.
Explicit in-page section and figure links still reveal their targets. Without
JavaScript, the links remain anchors and all panels are readable. The top-level
navigation scroll tracker remains scoped to the site header.
Within-request search uses the calibrated score;
cross-request mismatch detection uses request-head throughput and acceptance.
The expanded details include the empirical motivation table, confidence-guided ratio zooming, fixed-ratio random/Bayesian proposals, and the distinction between productive windows and uncommitted request-head trials.
The glyphs are conceptual illustrations, not experimental measurements. Labels
remain responsive HTML; tiny SVG labels are hidden on narrow screens where the
adjacent text conveys the same meaning. Keep the shared alignment, neutral
palette, and readable typography; avoid decorative clutter or unapproved work.

The sharing image is not displayed in the page body. When updating it, render
`assets/social-card.svg` at 1200 × 630 with the local DM Sans font loaded, and
replace `assets/social-card.png`. Update the image alt text in `index.html` if
the image content changes. Preview refresh timing depends on the sharing platform.
