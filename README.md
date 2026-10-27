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
visitor's question and recent question context, and answers from public profile
information. The chat discloses the external processing and labels curated
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

Publication links should only be added when a public, verified URL is available.

The site's 2.21× SPIRIT result comes from a supplementary NF4 evaluation; the
paper reports 1.74× FP16 and 2.14× NF4 results. The supplementary
measurement uses 1,000 TinyStories requests on LLaMA-2-13B, with four controller
seeds on each of two hosts and one RTX A6000 per run. Complete-stream token/time
totals give 2.184542× and 2.207254× over each host's matched autoregressive baseline,
including online search and profile updates. The page rounds the higher host
aggregate to 2.21×; this is not a best-seed or post-search-only result. The public
summary states SPIRIT's achieved performance without attributing this later
measurement to the paper. Keep protocol details here for future maintenance.

## Presentation

The acceptance announcement is temporarily hidden. To show it again, remove
the `hidden` attribute from `<a class="announcement">` in `index.html`; update
its text as appropriate. It occupies no space while hidden. The publication's
venue and status remain visible independently.

The introduction stays left-aligned. The publication pairs its title and short
description with a compact conceptual diagram on desktop, stacking them on
mobile. The header contains navigation only; the publication omits the author
row. Native expandable research details contain the full summary, formula, and
control diagram; they work without JavaScript. The default diagram introduces
self-drafting, full verification, and throughput-guided ratio/layer adaptation.
The expanded diagram adds calibrated feedback, ratio-first search, and profile
reuse. The within-request loop shows token proposals, full-target verification,
committed output and timing; names length correction and EMA smoothing between
the measured throughput and controller score; and separates ratio localization
from layer-pattern refinement at a fixed ratio. Labels stay readable HTML rather
than shrinking with the vector artwork on small screens.
The cross-request diagram compares current head statistics with a stored
signature, shows active and historical ratio/layer configurations, and labels
the stay/switch/refine/restart choices. Historical profiles are probed on the
same request head only when mismatch rises. This diagram uses responsive HTML
labels and vector connectors so its meaning stays readable on narrow screens.
Within-request search uses the calibrated score;
cross-request mismatch detection uses request-head throughput and acceptance.
The glyphs are conceptual illustrations, not experimental measurements. Labels
remain responsive HTML; tiny SVG labels are hidden on narrow screens where the
adjacent text conveys the same meaning. Keep the shared alignment, neutral
palette, and readable typography; avoid decorative clutter or unapproved work.

The sharing image is not displayed in the page body. When updating it, render
`assets/social-card.svg` at 1200 × 630 with the local DM Sans font loaded, and
replace `assets/social-card.png`. Update the image alt text in `index.html` if
the image content changes. Preview refresh timing depends on the sharing platform.
