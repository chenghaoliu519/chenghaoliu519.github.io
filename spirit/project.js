"use strict";

// The article and its source links work without JavaScript. Reveal deep links
// only after research.js has enhanced the experiment pages.
const resultsStart = document.getElementById("results-figure-details");
function revealProjectTarget() {
  let target;
  try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); }
  catch { return; }
  if (!target) return;
  const experiment = target.closest(".experiment-panel");
  if (experiment) {
    const tab = document.querySelector('.experiment-tabs a[href="#' + experiment.id + '"]');
    if (tab?.getAttribute("aria-selected") !== "true") tab?.click();
  }
  for (let detail = target.closest("details"); detail; detail = detail.parentElement?.closest("details")) {
    detail.open = true;
  }
  const scrollTarget = target === experiment ? resultsStart : target;
  requestAnimationFrame(() => scrollTarget.scrollIntoView({ block: "start", behavior: "instant" }));
}
window.addEventListener("hashchange", revealProjectTarget);
window.addEventListener("pageshow", revealProjectTarget);
if (location.hash) revealProjectTarget();

// Maintain useful shareable URLs when changing experiment topics.
document.querySelector(".experiment-tabs")?.addEventListener("click", event => {
  const tab = event.target.closest("a[role='tab']");
  if (!tab || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  history.replaceState(history.state, "", tab.hash);
  resultsStart.scrollIntoView({ block: "start", behavior: "instant" });
});
document.querySelector(".experiment-tabs")?.addEventListener("keydown", event => {
  if (!["ArrowRight", "ArrowLeft", "Home", "End", " "].includes(event.key)) return;
  const tab = event.currentTarget.querySelector('[aria-selected="true"]');
  if (tab) {
    history.replaceState(history.state, "", tab.hash);
    resultsStart.scrollIntoView({ block: "start", behavior: "instant" });
  }
});

const projectNav = Array.from(document.querySelectorAll(".project-nav a"))
  .map(link => ({ link, section: document.getElementById(link.hash.slice(1)) }))
  .filter(item => item.section);
const header = document.querySelector(".project-header");
let pendingFrame = null;
function updateProjectNav() {
  pendingFrame = null;
  const activation = (header?.getBoundingClientRect().height || 0) + 50;
  const atBottom = window.scrollY > 0 && window.scrollY + innerHeight >= document.documentElement.scrollHeight - 2;
  let current = atBottom ? projectNav.at(-1) : undefined;
  if (!atBottom) for (const item of projectNav) {
    if (item.section.getBoundingClientRect().top <= activation) current = item;
  }
  for (const item of projectNav) {
    if (item === current) item.link.setAttribute("aria-current", "location");
    else item.link.removeAttribute("aria-current");
  }
}
function scheduleProjectNav() {
  if (pendingFrame === null) pendingFrame = requestAnimationFrame(updateProjectNav);
}
window.addEventListener("scroll", scheduleProjectNav, { passive: true });
window.addEventListener("resize", scheduleProjectNav);
window.addEventListener("load", scheduleProjectNav);
if ("ResizeObserver" in window) new ResizeObserver(scheduleProjectNav).observe(document.body);
scheduleProjectNav();

const copyCitation = document.getElementById("copy-citation");
const citationStatus = document.getElementById("citation-status");
if (copyCitation && navigator.clipboard && window.isSecureContext) {
  copyCitation.hidden = false;
  copyCitation.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(document.getElementById("citation-text").textContent);
      citationStatus.textContent = "BibTeX copied.";
    } catch {
      citationStatus.textContent = "Select the citation above to copy it, or download the BibTeX file.";
    }
  });
}
