"use strict";

// Keep each experiment group on its own page while preserving ordinary anchor links.
const experimentTabs = document.querySelector(".experiment-tabs");
const experimentViews = Array.from(experimentTabs?.querySelectorAll("a") || [])
  .map((tab) => ({ tab, panel: document.getElementById(tab.hash.slice(1)) }))
  .filter(({ panel }) => panel);

if (experimentTabs && experimentViews.length) {
  experimentTabs.setAttribute("role", "tablist");
  for (const { tab, panel } of experimentViews) {
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", panel.id);
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", tab.id);
    panel.tabIndex = 0;
  }

  function selectExperiment(view, { focus = false, scroll = false } = {}) {
    for (const item of experimentViews) {
      const active = item === view;
      item.panel.hidden = !active;
      item.tab.setAttribute("aria-selected", String(active));
      item.tab.tabIndex = active ? 0 : -1;
    }
    if (focus) view.tab.focus({ preventScroll: true });
    if (scroll) experimentTabs.scrollIntoView({ block: "start", behavior: "instant" });
  }

  for (const [index, view] of experimentViews.entries()) {
    view.tab.addEventListener("click", (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      selectExperiment(view, { scroll: true });
    });
    view.tab.addEventListener("keydown", (event) => {
      let next;
      if (event.key === "ArrowRight") next = (index + 1) % experimentViews.length;
      else if (event.key === "ArrowLeft") next = (index + experimentViews.length - 1) % experimentViews.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = experimentViews.length - 1;
      else if (event.key === " ") next = index;
      else return;
      event.preventDefault();
      selectExperiment(experimentViews[next], { focus: true, scroll: true });
    });
  }

  selectExperiment(experimentViews[0]);
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) selectExperiment(experimentViews[0]);
  });
  window.addEventListener("hashchange", () => {
    let target;
    try {
      target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    } catch { return; }
    const view = experimentViews.find(({ panel }) => panel === target || panel.contains(target));
    if (view) selectExperiment(view);
  });
}

// Both ranges remain readable without JavaScript and in print.
for (const group of document.querySelectorAll("[data-chart-views]")) {
  const controls = group.querySelector(".chart-view-controls");
  const buttons = Array.from(group.querySelectorAll("[data-chart-select]"));
  const views = Array.from(group.querySelectorAll("[data-chart-view]"));
  if (!controls || !buttons.length || buttons.length !== views.length) continue;
  function select(name) {
    for (const button of buttons) button.setAttribute("aria-pressed", String(button.dataset.chartSelect === name));
    for (const view of views) view.hidden = view.dataset.chartView !== name;
  }
  for (const button of buttons) button.addEventListener("click", () => select(button.dataset.chartSelect));
  select(buttons[0].dataset.chartSelect);
  controls.hidden = false;
}
