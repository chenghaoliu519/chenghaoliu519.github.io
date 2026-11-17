"use strict";

// A single clock coordinates draft, verification, feedback and profile recall.
// All motion is schematic; no measured throughput is animated.
(() => {
  const demo = document.querySelector("[data-overview-demo]");
  if (!demo) return;
  const overview = demo.closest(".research-panel");
  const play = demo.querySelector("[data-overview-play]");
  const controls = demo.querySelector("[data-overview-controls]");
  const buttons = Array.from(controls.querySelectorAll("[data-overview-step]"));
  const stories = demo.querySelector("[data-overview-stories]");
  const copies = Array.from(stories.querySelectorAll("[data-overview-copy]"));
  const tokens = Array.from(demo.querySelectorAll("[data-token]"));
  const steps = buttons.map(button => button.dataset.overviewStep);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const duration = 5200;
  const draftLayers = Array.from(demo.querySelectorAll("[data-layer]"));
  const skipCount = demo.querySelector("[data-skip-count]");
  const routeLabel = demo.querySelector(".ov-feedback-label");
  // The recalled mask is the highlighted profile shown in the bank.
  const recalled = Array.from(demo.querySelectorAll(".ov-profile-1 i"))
    .flatMap((cell, i) => cell.classList.contains("filled") ? [i] : []);
  const coarse = [0, 5];
  const refined = [0, 3];
  const scenes = {
    decode: [
      { at: 0, beat: "draft", layers: recalled, label: "Committed tokens per decode second" },
      { at: .32, beat: "verify", layers: recalled, label: "Committed tokens per decode second" },
      { at: .62, beat: "commit", layers: recalled, label: "Committed tokens per decode second" }
    ],
    adapt: [
      { at: 0, beat: "feedback", layers: recalled, label: "Calibrate for prefix length" },
      { at: .32, beat: "ratio", layers: coarse, label: "Change how many sublayers to skip" },
      { at: .65, beat: "pattern", layers: refined, label: "Move the skips at the same ratio" }
    ],
    reuse: [
      { at: 0, beat: "compare", layers: refined, label: "Compare throughput and acceptance" },
      { at: .48, beat: "match", layers: refined, label: "Select a compatible profile" },
      { at: .78, beat: "recall", layers: recalled, label: "Restore its layer pattern" }
    ]
  };
  let scene = null;
  let requested = !reduced.matches;
  let selectedManually = !requested;
  let visible = false;
  let printing = false;
  let index = 0;
  let elapsed = requested ? 0 : duration * .94;
  let lastTime = null;
  let frame = null;
  const clamp = value => Math.max(0, Math.min(1, value));

  function data(name, value) {
    if (demo.dataset[name] !== value) demo.dataset[name] = value;
  }
  function render() {
    const progress = clamp(elapsed / duration);
    const step = steps[index];
    let next = scenes[step][0];
    for (const candidate of scenes[step]) {
      if (candidate.at > progress) break;
      next = candidate;
    }
    if (next !== scene) {
      scene = next;
      data("step", step);
      data("beat", scene.beat);
      draftLayers.forEach(layer => {
        layer.toggleAttribute("data-kept", scene.layers.includes(Number(layer.dataset.layer)));
      });
      skipCount.textContent = (draftLayers.length - scene.layers.length) + " of " + draftLayers.length + " sublayers skipped";
      routeLabel.textContent = scene.label;
      buttons.forEach((button, i) => button.setAttribute("aria-pressed", String(i === index)));
      copies.forEach(copy => { copy.hidden = copy.dataset.overviewCopy !== step; });
    }
    demo.style.setProperty("--ov-progress", progress.toFixed(4));
    demo.style.setProperty("--ov-draft-flight", clamp(progress / .32).toFixed(4));
    demo.style.setProperty("--ov-verify-flight", clamp((progress - .32) / .3).toFixed(4));
    let feedback = 0;
    if (step === "adapt") feedback = clamp(progress / .32);
    if (step === "reuse") feedback = clamp((progress - .48) / .30);
    demo.style.setProperty("--ov-feedback", feedback.toFixed(4));
    const committed = index === 0 ? Math.floor(clamp((progress - .62) / .3) * tokens.length) : tokens.length;
    tokens.forEach((token, i) => {
      if (token.hasAttribute("data-committed") !== (i < committed)) token.toggleAttribute("data-committed", i < committed);
    });
  }
  function running() {
    return requested && visible && !overview.hidden && !document.hidden && !printing;
  }
  function tick(time) {
    frame = null;
    if (!running()) return;
    if (lastTime !== null) elapsed += Math.min(time - lastTime, 100);
    lastTime = time;
    if (elapsed >= duration) {
      elapsed %= duration;
      index = (index + 1) % steps.length;
    }
    render();
    frame = window.requestAnimationFrame(tick);
  }
  function sync() {
    if (frame !== null) window.cancelAnimationFrame(frame);
    frame = null;
    lastTime = null;
    data("running", String(running()));
    data("snapshot", String(selectedManually));
    play.dataset.paused = String(!requested);
    play.querySelector("span").textContent = requested ? "Pause" : "Play";
    play.setAttribute("aria-label", requested ? "Pause animation" : "Play animation");
    if (running()) frame = window.requestAnimationFrame(tick);
  }
  function select(next) {
    requested = false;
    index = next;
    selectedManually = true;
    elapsed = duration * (index === 1 ? .82 : .96);
    render();
    sync();
  }
  play.addEventListener("click", () => {
    if (!requested && selectedManually) {
      elapsed = 0;
      selectedManually = false;
      render();
    }
    requested = !requested;
    sync();
  });
  buttons.forEach((button, i) => {
    button.addEventListener("click", () => select(i));
    button.addEventListener("keydown", event => {
      let next;
      if (event.key === "ArrowRight") next = (i + 1) % steps.length;
      else if (event.key === "ArrowLeft") next = (i + steps.length - 1) % steps.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = steps.length - 1;
      else return;
      event.preventDefault();
      select(next);
      buttons[next].focus();
    });
  });
  document.addEventListener("visibilitychange", sync);
  new MutationObserver(sync).observe(overview, { attributes:true, attributeFilter:["hidden"] });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].intersectionRatio >= .15;
      sync();
    }, { threshold:[0,.15] }).observe(demo);
  } else visible = true;
  reduced.addEventListener("change", () => { requested = !reduced.matches; sync(); });
  window.addEventListener("beforeprint", () => { printing = true; sync(); });
  window.addEventListener("afterprint", () => { printing = false; sync(); });
  demo.dataset.enhanced = "";
  demo.querySelector("[data-overview-static]").hidden = true;
  stories.hidden = false;
  controls.hidden = false;
  play.hidden = false;
  render();
  sync();
})();
