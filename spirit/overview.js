"use strict";

(() => {
  const figure = document.querySelector("[data-overview-demo]");
  if (!figure) return;

  const views = Array.from(figure.querySelectorAll(".film-scene"));
  const buttons = Array.from(figure.querySelectorAll("[data-chapter]"));
  const play = figure.querySelector(".film-play");
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const modeInputs = Array.from(figure.querySelectorAll('[name="overview-view"]'));
  const model = figure.querySelector("#model-flow");
  const renderModel = createModelRenderer(model);
  let example = figure.querySelector("#show-example").checked;
  function chapterDuration(index) {
    if (!example) return 5200;
    return buttons[index].dataset.chapter === "decode" ? 10000 : 6800;
  }
  let duration = chapterDuration(0);
  let exampleOpened = example;
  let modelFrame = null;
  const supported = typeof Element.prototype.animate === "function";
  let requested = supported && !motion.matches;
  let inView = false;
  let printing = false;
  let selected = 0;
  let tracks = [];
  let clock;
  let snapshot = !requested;

  function createModelRenderer(demo) {
    const tokens = Array.from(demo.querySelectorAll("[data-token]"));
    const copies = Array.from(demo.querySelectorAll("[data-overview-copy]"));
    const clamp = value => Math.max(0, Math.min(1, value));
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
    function data(name, value) {
      if (demo.dataset[name] !== value) demo.dataset[name] = value;
    }
    function render(step, progress) {
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
        copies.forEach(copy => copy.setAttribute("aria-hidden", String(copy.dataset.overviewCopy !== step)));
      }
      demo.style.setProperty("--ov-draft-flight", clamp(progress / .32).toFixed(4));
      demo.style.setProperty("--ov-verify-flight", clamp((progress - .32) / .3).toFixed(4));
      let feedback = 0;
      if (step === "adapt") feedback = clamp(progress / .32);
      if (step === "reuse") feedback = clamp((progress - .48) / .30);
      demo.style.setProperty("--ov-feedback", feedback.toFixed(4));
      const committed = step === "decode" ? Math.floor(clamp((progress - .62) / .3) * tokens.length) : tokens.length;
      tokens.forEach((token, i) => {
        if (token.hasAttribute("data-committed") !== (i < committed)) token.toggleAttribute("data-committed", i < committed);
      });
    }
    demo.dataset.enhanced = "";
    demo.querySelector("[data-overview-static]").hidden = true;
    demo.querySelector("[data-overview-stories]").hidden = false;
    return render;
  }

  // All tracks share a chapter clock. The holds give readers time to inspect
  // both ends of a movement, and pausing freezes every object together.
  function segment(node, start, end, from, to) {
    const frames = [
      { ...from, offset:0 }, { ...from, offset:start, easing:"cubic-bezier(.22,.75,.24,1)" },
      { ...to, offset:end }, { ...to, offset:1 }
    ];
    const animation = node.animate(frames, {duration, fill:"both"});
    animation.pause();
    tracks.push(animation);
    return animation;
  }

  // Measure both resting positions before any track moves these elements.
  function travelFrom(source, destination) {
    const a = source.getBoundingClientRect();
    const b = destination.getBoundingClientRect();
    const x = a.left + a.width / 2 - b.left - b.width / 2;
    const y = a.top + a.height / 2 - b.top - b.height / 2;
    return "translate(" + x + "px," + y + "px)";
  }

  function decode(view) {
    // Draft each token in place, then mark the prefix boundary in one target pass.
    const proposed = {color:"#315775", backgroundColor:"#f1f5f9", borderColor:"#cad7e1", textDecorationColor:"transparent"};
    const verified = {color:"var(--token-ink)", backgroundColor:"var(--token-paper)", borderColor:"var(--token-rule)", textDecorationColor:"var(--token-ink)"};
    view.querySelectorAll(".draft-token").forEach((token, i) => {
      const start = i * .041;
      segment(token, start, start + .045, {opacity:0}, {opacity:1});
      segment(token, .43, .47, proposed, verified);
    });
    view.querySelectorAll(".proposal-verdict").forEach(label =>
      segment(label, .43, .47, {opacity:0}, {opacity:1}));
    segment(view.querySelector(".commit-pending"), .62, .64, {opacity:1}, {opacity:0});
    segment(view.querySelector(".commit-sentence"), .64, .70, {opacity:0}, {opacity:1});
  }

  function adapt(view) {
    const coarse = view.querySelector(".film-coarse");
    const refined = view.querySelector(".film-refined");
    segment(coarse, .12, .23, {opacity:.16, transform:"translateY(-6px)"}, {opacity:1, transform:"none"});
    segment(coarse.querySelector(".film-layer-overlay"), .29, .43,
      {opacity:1, transform:"translateX(200%)"}, {opacity:0, transform:"translate(200%,5px) scale(.78)"});
    segment(coarse.previousElementSibling.querySelector("small"), .37, .47, {opacity:0}, {opacity:1});
    segment(refined, .49, .61, {opacity:.16, transform:"translateY(-6px)"}, {opacity:1, transform:"none"});
    segment(refined.querySelector(".film-layer-overlay"), .64, .83,
      {transform:"translateX(500%)"}, {transform:"translateX(300%)"});
  }

  function reuse(view) {
    const match = view.querySelector(".film-match");
    const restored = view.querySelector(".film-restored");
    const mask = match.querySelector(".film-mask");
    const handoff = travelFrom(mask, restored) + " scale(" +
      mask.getBoundingClientRect().width / restored.getBoundingClientRect().width + ")";
    view.querySelectorAll(".signature").forEach((signal, i) => {
      segment(signal.querySelector("b"), .02, .16, {opacity:.2}, {opacity:1});
      segment(signal.querySelector("em"), .12 + i * .06, .24 + i * .06,
        {opacity:0, transform:"scale(.55)"}, {opacity:1, transform:"scale(1)"});
    });
    view.querySelectorAll(".film-candidate").forEach(card =>
      segment(card, .36, .51, {opacity:1}, {opacity:.55}));
    segment(match, .32, .50, {filter:"saturate(0)", opacity:.75}, {filter:"none", opacity:1});
    segment(view.querySelector(".recall-path"), .48, .68, {transform:"scaleY(0)"}, {transform:"scaleY(1)"});
    segment(restored, .53, .79, {transform:handoff, opacity:0}, {transform:"none", opacity:1});
  }

  const draw = {decode, adapt, reuse};
  function stopModelFrames() {
    if (modelFrame !== null) window.cancelAnimationFrame(modelFrame);
    modelFrame = null;
  }

  function updateModel() {
    modelFrame = null;
    if (!clock || example || clock.playState !== "running") return;
    renderModel(buttons[selected].dataset.chapter, Math.min(1, clock.currentTime / duration));
    modelFrame = window.requestAnimationFrame(updateModel);
  }

  function dispose() {
    stopModelFrames();
    if (clock) clock.onfinish = null;
    tracks.forEach(track => track.cancel());
    tracks = [];
    clock = null;
  }

  function present(index, fraction) {
    dispose();
    selected = index;
    duration = chapterDuration(index);
    const position = fraction * duration;
    if (!example) renderModel(buttons[selected].dataset.chapter, fraction);
    views.forEach((view, i) => view.setAttribute("aria-hidden", String(i !== selected)));
    buttons.forEach((button, i) => button.setAttribute("aria-pressed", String(i === selected)));
    if (supported && !printing) {
      const view = views[selected];
      if (example) draw[buttons[selected].dataset.chapter](view);
      clock = buttons[selected].querySelector(".film-progress").animate(
        [{transform:"scaleX(0)"}, {transform:"scaleX(1)"}], {duration, fill:"both"});
      clock.pause();
      tracks.push(clock);
      tracks.forEach(track => { track.currentTime = position; });
      clock.onfinish = () => {
        if (requested && !printing && !snapshot) present((selected + 1) % views.length, 0);
      };
    }
    sync();
  }

  function sync() {
    const running = requested && inView && !printing && !document.hidden && !figure.closest(".research-panel").hidden;
    tracks.forEach(track => {
      if (running && track.playState === "paused") track.play();
      if (!running && track.playState === "running") track.pause();
    });
    stopModelFrames();
    if (running && !example && clock) modelFrame = window.requestAnimationFrame(updateModel);
    play.dataset.playing = String(requested);
    play.setAttribute("aria-label", requested ? "Pause animation" : "Play animation");
    play.querySelector("[data-play-label]").textContent = requested ? "Pause" : "Play";
  }

  function choose(index) {
    snapshot = !requested;
    present(index, snapshot ? 1 : 0);
  }

  play.addEventListener("click", () => {
    requested = !requested;
    if (requested && snapshot) {
      snapshot = false;
      present(selected, 0);
    } else sync();
  });
  buttons.forEach((button, index) => {
    button.addEventListener("click", () => choose(index));
    button.addEventListener("keydown", event => {
      const n = buttons.length;
      const targets = {ArrowLeft:(index+n-1)%n, ArrowRight:(index+1)%n, Home:0, End:n-1};
      if (!(event.key in targets)) return;
      event.preventDefault();
      choose(targets[event.key]);
      buttons[selected].focus();
    });
  });
  modeInputs.forEach(input => input.addEventListener("change", () => {
    const fraction = clock ? clock.currentTime / duration : 1;
    example = input.value === "example";
    if (example && !exampleOpened) {
      exampleOpened = true;
      choose(0);
    } else present(selected, Math.min(1, fraction));
  }));
  figure.querySelector(".film-chapters").hidden = false;
  play.hidden = !supported;
  figure.dataset.enhanced = "";
  if (supported) figure.dataset.choreography = "";
  present(0, snapshot ? 1 : 0);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.intersectionRatio >= .15;
      sync();
    }, {threshold:[0,.15]}).observe(figure);
  } else { inView = true; sync(); }
  new MutationObserver(sync).observe(figure.closest(".research-panel"), {attributes:true, attributeFilter:["hidden"]});
  document.addEventListener("visibilitychange", sync);
  motion.addEventListener("change", () => {
    requested = supported && !motion.matches;
    choose(selected);
  });
  if ("ResizeObserver" in window) {
    let width = figure.clientWidth;
    new ResizeObserver(() => {
      if (!figure.clientWidth || width === figure.clientWidth || printing) return;
      width = figure.clientWidth;
      if (!example) return;
      present(selected, (clock?.currentTime || 0) / duration);
    }).observe(figure);
  }

  let savedPosition = 0;
  window.addEventListener("beforeprint", () => {
    if (printing) return;
    printing = true;
    savedPosition = clock?.currentTime || 0;
    dispose();
    if (!example) renderModel(buttons[selected].dataset.chapter, 1);
    delete figure.dataset.choreography;
    views.forEach(view => view.removeAttribute("aria-hidden"));
  });
  window.addEventListener("afterprint", () => {
    printing = false;
    if (supported) figure.dataset.choreography = "";
    present(selected, savedPosition / duration);
  });
})();
