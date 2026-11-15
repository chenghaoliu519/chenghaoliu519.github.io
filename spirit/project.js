"use strict";

// Native anchors expose the whole article without JavaScript. Enhancement keeps
// one research topic open and resolves deep links before scrolling.
const reader = document.getElementById("research");
const topicTabs = document.querySelector(".project-topic-tabs");
const topics = Array.from(topicTabs?.querySelectorAll("a") || [])
  .map(tab => ({ tab, panel: document.getElementById(tab.hash.slice(1)) }))
  .filter(item => item.panel);
const resultsStart = document.getElementById("results-figure-details");
let resolvingHash = false;

function selectTopic(topic, { focus = false } = {}) {
  for (const item of topics) {
    const selected = item === topic;
    item.panel.hidden = !selected;
    item.tab.setAttribute("aria-selected", String(selected));
    item.tab.tabIndex = selected ? 0 : -1;
  }
  if (focus) topic.tab.focus({ preventScroll: true });
}
function setFragment(hash, replace = false) {
  if (location.hash !== hash) history[replace ? "replaceState" : "pushState"](history.state, "", hash);
}
if (topicTabs && topics.length) {
  topicTabs.setAttribute("role", "tablist");
  for (const [index, topic] of topics.entries()) {
    topic.tab.setAttribute("role", "tab");
    topic.tab.setAttribute("aria-controls", topic.panel.id);
    topic.panel.setAttribute("role", "tabpanel");
    topic.panel.setAttribute("aria-labelledby", topic.tab.id);
    topic.tab.addEventListener("click", event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      setFragment(topic.tab.hash);
      revealProjectTarget();
    });
    topic.tab.addEventListener("keydown", event => {
      let next;
      if (event.key === "ArrowRight") next = (index + 1) % topics.length;
      else if (event.key === "ArrowLeft") next = (index + topics.length - 1) % topics.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = topics.length - 1;
      else if (event.key === " ") next = index;
      else return;
      event.preventDefault();
      setFragment(topics[next].tab.hash, true);
      revealProjectTarget();
      topics[next].tab.focus({ preventScroll: true });
    });
  }
  selectTopic(topics[0]);
}
function revealProjectTarget() {
  let target;
  try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); }
  catch { return; }
  if (!target) {
    if (!location.hash && topics.length) selectTopic(topics[0]);
    return;
  }
  const topic = topics.find(item => item.panel === target || item.panel.contains(target));
  if (topic) selectTopic(topic);
  const experiment = target.closest(".experiment-panel")
    || (target.id === "spirit-experiments" ? document.getElementById("experiment-models") : null);
  if (experiment) {
    const tab = document.querySelector('.experiment-tabs a[href="#' + experiment.id + '"]');
    resolvingHash = true;
    if (tab?.getAttribute("aria-selected") !== "true") tab?.click();
    resolvingHash = false;
  }
  for (let detail = target.closest("details"); detail; detail = detail.parentElement?.closest("details")) {
    detail.open = true;
  }
  // A chart-range anchor must also reveal its matching chart.
  const chartView = target.closest("[data-chart-view]");
  if (chartView?.hidden) {
    chartView.closest("[data-chart-views]")?.querySelector('[data-chart-select="' + chartView.dataset.chartView + '"]')?.click();
  }
  const scrollTarget = target === topic?.panel ? reader : target === experiment ? resultsStart : target;
  requestAnimationFrame(() => scrollTarget.scrollIntoView({ block: "start", behavior: "instant" }));
}
window.addEventListener("hashchange", revealProjectTarget);
window.addEventListener("pageshow", revealProjectTarget);
if (location.hash) revealProjectTarget();

// research.js owns the experiment controls; this page adds shareable history.
document.querySelector(".experiment-tabs")?.addEventListener("click", event => {
  const tab = event.target.closest("a[role='tab']");
  if (!tab || resolvingHash || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  setFragment(tab.hash);
  resultsStart.scrollIntoView({ block: "start", behavior: "instant" });
});
document.querySelector(".experiment-tabs")?.addEventListener("keydown", event => {
  if (!["ArrowRight", "ArrowLeft", "Home", "End", " "].includes(event.key)) return;
  const tab = event.currentTarget.querySelector('[aria-selected="true"]');
  if (tab) {
    setFragment(tab.hash, true);
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
  const activation = (header?.getBoundingClientRect().height || 0) + 90;
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
