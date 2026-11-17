"use strict";

// The illustration explains control flow; it never simulates measured speedups.
(() => {
  const demo = document.querySelector("[data-overview-demo]");
  if (!demo) return;
  const overview = demo.closest(".research-panel");
  const play = demo.querySelector("[data-overview-play]");
  const controls = demo.querySelector("[data-overview-controls]");
  const buttons = Array.from(controls.querySelectorAll("[data-overview-step]"));
  const stories = demo.querySelector("[data-overview-stories]");
  const copies = Array.from(stories.querySelectorAll("[data-overview-copy]"));
  const steps = buttons.map(button => button.dataset.overviewStep);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  let requested = !reduced.matches;
  let visible = false;
  let printing = false;
  let timer = null;
  let index = 0;

  function showStep(next) {
    index = (next + steps.length) % steps.length;
    demo.dataset.step = steps[index];
    buttons.forEach((button, i) => button.setAttribute("aria-pressed", String(i === index)));
    copies.forEach(copy => { copy.hidden = copy.dataset.overviewCopy !== steps[index]; });
  }
  function sync() {
    window.clearTimeout(timer);
    timer = null;
    const running = requested && visible && !overview.hidden && !document.hidden && !printing;
    demo.dataset.running = String(running);
    play.dataset.paused = String(!requested);
    play.querySelector("span").textContent = requested ? "Pause" : "Play";
    play.setAttribute("aria-label", requested ? "Pause animation" : "Play animation");
    if (running) timer = window.setTimeout(() => {
      showStep(index + 1);
      sync();
    }, 4500);
  }
  play.addEventListener("click", () => { requested = !requested; sync(); });
  buttons.forEach((button, i) => {
    button.addEventListener("click", () => { requested = false; showStep(i); sync(); });
    button.addEventListener("keydown", event => {
      let next;
      if (event.key === "ArrowRight") next = (i + 1) % steps.length;
      else if (event.key === "ArrowLeft") next = (i + steps.length - 1) % steps.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = steps.length - 1;
      else return;
      event.preventDefault();
      requested = false;
      showStep(next);
      buttons[next].focus();
      sync();
    });
  });
  document.addEventListener("visibilitychange", sync);
  new MutationObserver(sync).observe(overview, { attributes:true, attributeFilter:["hidden"] });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      sync();
    }, { threshold:.15 }).observe(demo);
  }
  reduced.addEventListener("change", () => { requested = !reduced.matches; sync(); });
  window.addEventListener("beforeprint", () => { printing = true; sync(); });
  window.addEventListener("afterprint", () => { printing = false; sync(); });
  demo.querySelector("[data-overview-static]").hidden = true;
  stories.hidden = false;
  controls.hidden = false;
  play.hidden = false;
  showStep(0);
  sync();
})();
