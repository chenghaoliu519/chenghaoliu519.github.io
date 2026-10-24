# Chenghao Liu — Academic homepage

A lightweight, responsive academic homepage for GitHub Pages.

**Website:** https://chenghaoliu519.github.io/

## Files

- `index.html`: biography, research areas, publication, background, and contact.
- `styles.css`: responsive layout, typography, and print styles.
- `site.js`: optional email-copy control and navigation highlighting.
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

## Content scope

This public repository contains only the website. It intentionally excludes
the full CV, private manuscripts, unpublished experimental results, research
source code, phone numbers, and personal photographs. Do not copy private
project archives or credentials into this repository.

Publication links should only be added when a public, verified URL is available.

## Presentation

The introduction and publication follow a continuous, left-aligned reading
column. The publication omits the author row and expands into a full-width
control diagram. The diagram explains the throughput decomposition, productive
execution windows, length-normalized feedback, ratio-first search, and profile
reuse across requests. Within-request search uses the calibrated score;
cross-request mismatch detection uses request-head throughput and acceptance.
The ratio and layer-pattern glyphs are conceptual SVG illustrations, not
experimental measurements. Labels remain responsive HTML. Keep the shared
alignment, neutral palette, and readable typography; avoid decorative clutter
or exposing unpublished work.

The sharing image is not displayed in the page body. When updating it, render
`assets/social-card.svg` at 1200 × 630 with the local DM Sans font loaded, and
replace `assets/social-card.png`. Update the image alt text in `index.html` if
the image content changes. Preview refresh timing depends on the sharing platform.
