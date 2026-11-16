"use strict";

// Ordinary anchors expose every section without JavaScript. Enhancement keeps
// one reading view open and reveals deep-link targets before scrolling.
const reader = document.getElementById("research");
const topicTabs = document.querySelector(".project-topic-tabs");
const topics = Array.from(topicTabs?.querySelectorAll("a") || [])
  .map(tab => ({ tab, panel: document.getElementById(tab.hash.slice(1)) }))
  .filter(item => item.panel);
const resultsStart = document.getElementById("results-figure-details");
let resolvingHash = false;
document.querySelectorAll(".supporting-evidence").forEach(detail => { detail.open = false; });

function selectTopic(topic) {
  for (const item of topics) {
    const selected = item === topic;
    item.panel.hidden = !selected;
    item.tab.setAttribute("aria-selected", String(selected));
    item.tab.tabIndex = selected ? 0 : -1;
  }
}
function setFragment(hash, replace = false) {
  if (location.hash !== hash) history[replace ? "replaceState" : "pushState"](history.state, "", hash);
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
  if (target.id === "main" && topics.length) selectTopic(topics[0]);
  const experiment = target.closest(".experiment-panel")
    || (target.id === "spirit-experiments" ? document.getElementById("experiment-models") : null);
  if (experiment) {
    const tab = document.querySelector('.experiment-tabs a[href="#' + experiment.id + '"]');
    resolvingHash = true;
    if (tab?.getAttribute("aria-selected") !== "true") tab?.click();
    resolvingHash = false;
  }
  if (target.id === "citation") document.getElementById("citation-bibtex").open = true;
  for (let detail = target.closest("details"); detail; detail = detail.parentElement?.closest("details")) {
    detail.open = true;
  }
  const chartView = target.closest("[data-chart-view]");
  if (chartView?.hidden) {
    chartView.closest("[data-chart-views]")?.querySelector('[data-chart-select="' + chartView.dataset.chartView + '"]')?.click();
  }
  const scrollTarget = target === topic?.panel ? topic.panel.querySelector("h2") || reader : target === experiment ? resultsStart : target;
  requestAnimationFrame(() => scrollTarget.scrollIntoView({ block: "start", behavior: "instant" }));
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
window.addEventListener("hashchange", revealProjectTarget);
window.addEventListener("pageshow", revealProjectTarget);
if (location.hash) revealProjectTarget();

// research.js owns the experiment controls; add shareable history here.
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

// Print the complete article, then restore disclosure preferences.
const printDetails = Array.from(document.querySelectorAll(".citation-bibtex, .supporting-evidence"));
let detailsBeforePrint = null;
window.addEventListener("beforeprint", () => {
  if (detailsBeforePrint !== null) return;
  detailsBeforePrint = printDetails.map(detail => [detail, detail.open]);
  printDetails.forEach(detail => { detail.open = true; });
});
window.addEventListener("afterprint", () => {
  detailsBeforePrint?.forEach(([detail, open]) => { detail.open = open; });
  detailsBeforePrint = null;
});
