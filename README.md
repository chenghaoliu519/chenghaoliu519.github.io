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
The three approved poster components are integrated into Problem, Method, and
Experiments as responsive HTML and inline SVG. Readers see the measured
motivation landscape, the control loops, and the experimental evidence directly.
The original PNGs remain preserved at `assets/figures/spirit-motivation-v06.png`,
`assets/figures/spirit-method-v32.png`, and `assets/figures/spirit-results-v23.png`.
These are exact copies of the supplied versions; keep future replacements
versioned. The separate method-flow PDF is published at
`assets/papers/spirit_flow.pdf` and linked in the method caption as “control-flow
diagram (PDF).”

The publication summary links the author-supplied
complete poster at `assets/figures/spirit-poster-neurips2026.png` and the presentation
PDF at `assets/slides/SPIRIT-NeurIPS2026.pdf`. These are exact source copies of the
supplied exports. The presentation link carries a content hash to refresh updated exports. The latest supplied `results/results.png`
is byte-identical to the versioned V23 figure already used for the results
disclosure. The poster and presentation confirm the comparison scopes and
broader HumanEval, architecture, and batching evaluations.

The public descriptions follow paper Appendix C.7 and the presentation's
long-stream study: 2.46× pooled decode speedup and 2.48× for the best full-stream
run. The publication headline labels NF4 self-drafting and the 1,000-request
stream. The FP16 maximum remains 1.74×; these maxima come from their respective
settings. Google Scholar is available in the introductory links.

The V23 results copy is checked against its supplied data and provenance:
SPIRIT leads SWIFT and D&V in all nine Table 1 settings. SpecBench's +17.2%
compares full-stream throughput (1.462 / 1.247), including online exploration
and updates; it is separate from the six post-adaptation task means. Reuse adds
9.8–10.3% over the no-reuse variant in two 600-request streams, each changing
tasks every 100 requests.

The sustained NF4 evaluation uses eight runs with distinct controller seeds.
Each starts from an empty controller and serves the same ordered 1,000-request
TinyStories stream with LLaMA-2-13B, fused NF4 self-drafts, and full FP16
verification on one RTX A6000. Pooled speedup uses each method's token and time
totals across runs. Decode timing includes online search and profile updates;
it excludes prefill, model loading, and one-time draft setup.

The +23.6% NF4/FP16 throughput ratio and 95% CI of +21.4–26.3% come from the
separate three-task LLaMA-2-13B comparison (Table 5). Both variants keep the
same FP16 verifier and optimize configurations separately. This three-task
comparison and the 1,000-request study are separate evaluations.

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
row. Research details contain Problem, Method, and Experiments as mutually exclusive,
keyboard-accessible tabs. They start closed on entry, reload, stale research
fragments, and back/forward restoration. Tab changes do not alter the URL.
Profile reuse stays inside Method. The introduction, top-level publication
preview, Paper / Poster / Slides PDF links, and the two 2.48x headlines remain.

Problem combines a layer-skipping schematic with the 400-configuration
acceptance plot and the complete 504-configuration ratio landscape. The latter
shows the best observation, median, and interquartile range at each of 21 ratios.
The spread is a distribution over configurations, not a confidence interval.

Method uses readable HTML labels and vector illustrations for productive
windows, calibrated boundary updates, ratio-first search, and request-head
profile reuse. Its four reuse outcomes are immediately visible. “Search details”
and “Profile reuse details” retain deeper algorithm explanations and start closed.
Method introduces the self-draft configuration and throughput objective, then
uses numbered sections for productive within-request search and cross-request
profile reuse. Step cards show the decoding loop; separate profile and outcome
cards explain reuse. Search and reuse details stay collapsed initially. The
disclosures retain ordinary keyboard-accessible details/summary behavior.

Within-request score Q uses length correction and EMA; cross-request matching
uses raw head throughput and acceptance. Request-head trial outputs are not
committed. The confidence plot and layer masks are explicitly schematic.

Experiments uses three mutually exclusive subpages: Models & tasks contains
the nine FP16 comparisons, SpecBench, and matched-batch results; NF4 decoding
contains sustained decoding and the separately labeled paired precision study;
Online adaptation contains configuration discovery, update costs, and reuse.
The experiment overview pairs the conclusion with the two headline metrics.
Outlined topic choices introduce each subpage; model tables highlight the SPIRIT
column and result surfaces group each chart with its measurement scope. The
main research navigation and request-range controls share rounded pill styling.

Models & tasks is selected initially. The secondary tabs support arrow keys,
Home/End, and Space without changing the URL. The current selection is retained
while switching main research topics and resets on a restored page. The sustained
figure separates setup, aggregation, and decode timing into labeled paragraphs;
longer captions use paragraph breaks. Captions and source notes increase to 13px
on screens up to 600px wide. Published Figure 3a columns are
used deliberately, including the requested SPIRIT endpoint of 1.61×. All 27
discovery observations and all 1,000 prefixes of the eight sustained runs are
retained. Straight segments connect observations; no smoothing, extrapolation,
or time-zero measurement is introduced. Full-stream and post-adaptation
SpecBench scopes, normalized timing and latency, and independent precision
and long-stream studies stay distinct.

The native SVGs are deterministically rendered from
`assets/data/spirit-research.json` by `scripts/render_research.py` and the three
templates under `scripts/research/`. The data preserves the adopted poster's
frozen values and records source hashes; no GPU measurements are rerun.
After editing a template, figure data, `styles.css`, `research.css`, or `research.js`, run:

    python3 scripts/render_research.py
    python3 scripts/render_research.py --check

Commit the rebuilt `index.html` with its sources. The renderer uses Python's
standard library and updates the site/research stylesheet and research script content hashes.
Graphs have SVG titles and descriptions, theme-aware colors, responsive labels,
and adjacent HTML conclusions. The sustained graph has accessible full-stream
and first-50-request controls; both ranges remain readable without JavaScript
and in print. All experiment subpages remain visible without JavaScript and in
print. Mochi's experiment source links open the matching main tab and subpage;
links to individual figure anchors also reveal their containing subpage.
Materials guidance describes the integrated charts rather than poster disclosures.


The sharing image is not displayed in the page body. When updating it, render
`assets/social-card.svg` at 1200 × 630 with the local DM Sans font loaded, and
replace `assets/social-card.png`. Update the image alt text in `index.html` if
the image content changes. Preview refresh timing depends on the sharing platform.
