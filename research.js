"use strict";

// Both ranges remain readable without JavaScript.
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
