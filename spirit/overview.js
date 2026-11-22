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
    if (!example) return buttons[index].dataset.chapter === "reuse" ? 12800 : 5200;
    return {decode:10000, adapt:11000, reuse:9000}[buttons[index].dataset.chapter];
  }
  let duration = chapterDuration(0);
  let exampleOpened = example;
  let chapterFrame = null;
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
    const savedMask = selector => Array.from(demo.querySelectorAll(selector))
      .flatMap((cell, i) => cell.classList.contains("filled") ? [i] : []);
    const recalled = savedMask(".ov-profile-1 i");
    const coarse = [0, 5];
    const refined = [0, 3];
    const profileA = demo.querySelector('[data-profile="A"]');
    const profileB = demo.querySelector('[data-profile="B"]');
    const profileC = demo.querySelector('[data-profile="C"]');
    const draft = demo.querySelector(".ov-stack-draft");
    const draftId = demo.querySelector(".ov-draft-id");
    // Draw the profile bank with the same layer geometry as the active draft.
    for (const [card, mask] of [[profileA, refined], [profileB, recalled], [profileC, savedMask(".ov-profile-2 i")]]) {
      const stack = draft.cloneNode(true);
      stack.setAttribute("class", "ov-bank-stack");
      stack.querySelectorAll("[data-layer]").forEach(layer => {
        layer.classList.toggle("ov-bank-kept", mask.includes(Number(layer.dataset.layer)));
        layer.removeAttribute("data-layer");
        layer.removeAttribute("data-kept");
      });
      card.prepend(stack);
    }

    const loop = demo.querySelector(".ov-feedback-loop svg");
    const route = loop.querySelector(".ov-profile-route");
    const routePaths = route.querySelectorAll(".ov-feedback-route, .ov-feedback-trace");
    const arrow = route.querySelector(".ov-profile-arrow");
    const measureRoute = loop.querySelector(".ov-measure-route");
    function alignRecallPath() {
      if (demo.dataset.step !== "reuse") return;
      const bounds = loop.getBoundingClientRect();
      if (!bounds.width) return;
      const center = element => {
        const rect = element.getBoundingClientRect();
        return Math.round((rect.left + rect.width / 2 - bounds.left) * 720 / bounds.width);
      };
      const from = center(profileB), to = center(draft);
      const path = `M${from} 44q0-11-12-11H${to + 12}q-12 0-12-12V2`;
      routePaths.forEach(line => line.setAttribute("d", path));
      arrow.setAttribute("d", `M${to - 4} 7l4-5 4 5`);
      measureRoute.setAttribute("d", `M${to} 2v36m-4-5 4 5 4-5`);
    }
    if ("ResizeObserver" in window) new ResizeObserver(alignRecallPath).observe(loop);

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
        { at: 0, beat: "monitor", layers: refined, label: "Measure request-head throughput and acceptance with the current profile (A)" },
        { at: .20, beat: "shift", layers: refined, label: "Throughput and acceptance fall below A’s historical ranges" },
        { at: .40, beat: "probe", layers: refined, label: "Compare A, B and C on the same request head" },
        { at: .68, beat: "match", layers: refined, label: "B outscores A. C falls short on throughput." },
        { at: .85, beat: "recall", layers: recalled, label: "Restore B’s skip ratio and layer pattern" }
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
        const enteringReuse = step === "reuse" && demo.dataset.step !== "reuse";
        data("step", step);
        data("beat", scene.beat);
        if (step === "reuse") {
          const restored = scene.beat === "recall";
          draftId.textContent = restored ? "B" : "A";
          if (enteringReuse) alignRecallPath();
        }
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
      if (step === "reuse") {
        feedback = clamp((progress - .68) / .17);
        // Let the shared probe start before its two candidate readings fade in together.
        demo.style.setProperty("--ov-active-measured", clamp((progress - .08) / .045).toFixed(4));
        demo.style.setProperty("--ov-candidates-measured", clamp((progress - .42) / .14).toFixed(4));
      }
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
  function track(node, frames) {
    const animation = node.animate(frames, {duration, fill:"both"});
    animation.pause();
    tracks.push(animation);
  }

  function segment(node, start, end, from, to) {
    track(node, [
      { ...from, offset:0 }, { ...from, offset:start, easing:"cubic-bezier(.22,.75,.24,1)" },
      { ...to, offset:end }, { ...to, offset:1 }
    ]);
  }

  function decode(view) {
    // Draft each token in place, then mark the prefix boundary in one target pass.
    const proposed = {color:"#315775", backgroundColor:"#f1f5f9", borderColor:"#cad7e1", textDecorationColor:"transparent"};
    const verified = {color:"var(--token-ink,#304f62)", backgroundColor:"var(--token-paper,#f4f7fa)", borderColor:"var(--token-rule,#c7d5df)", textDecorationColor:"currentColor"};
    view.querySelectorAll(".draft-token").forEach((token, i) => {
      const start = i * .033;
      segment(token, start, start + .045, {opacity:0}, {opacity:1});
      segment(token, .37, .42, proposed, verified);
    });
    view.querySelectorAll(".verify-decision").forEach(cell =>
      segment(cell, .37, .42, {backgroundColor:"#e3ede9"}, {backgroundColor:"var(--decision-fill)"}));
    view.querySelectorAll(".verify-decision span, .verdict-label").forEach(verdict =>
      segment(verdict, .37, .42, {opacity:0}, {opacity:1}));
    segment(view.querySelector(".draft-fix"), .46, .50, {opacity:0}, {opacity:1});
    segment(view.querySelector(".commit-pending"), .76, .78, {opacity:1}, {opacity:0});
    segment(view.querySelector(".commit-sentence"), .78, .83, {opacity:0}, {opacity:1});
  }

  const raised = {opacity:1, transform:"translateY(-2px)"};
  const lowered = {opacity:0, transform:"translateY(0)"};

  function adapt(view) {
    const clear = {backgroundColor:"transparent"};
    const chosen = {backgroundColor:"#eaf4ef"};
    // As productive windows accumulate, the ratio estimates separate.
    view.querySelectorAll(".score-range").forEach(bounds =>
      segment(bounds, .10, .30, {transform:"scaleX(2.6)"}, {transform:"scaleX(1)"}));
    segment(view.querySelector(".ratio-four"), .33, .39, clear, chosen);
    segment(view.querySelector(".ratio-choice"), .33, .39, {opacity:0}, {opacity:1});

    const pattern = view.querySelector(".refined-pattern");
    const first = view.querySelector(".initial-pattern");
    segment(first, .40, .48, {opacity:.24}, {opacity:1});
    segment(first.querySelector(".score-dot"), .45, .50, {opacity:0}, {opacity:1});
    segment(pattern, .52, .58, {opacity:.24}, {opacity:1});
    // Keep four skips while exchanging the executed sublayer at 6 for 4.
    segment(pattern.querySelector('[data-layer="6"] b'), .59, .67, raised, lowered);
    segment(pattern.querySelector('[data-layer="4"] b'), .59, .67, lowered, raised);
    segment(pattern.querySelector(".score-dot"), .68, .73, {opacity:0}, {opacity:1});
    segment(pattern, .76, .81, clear, chosen);
    segment(view.querySelector(".pattern-choice"), .76, .81, {opacity:0}, {opacity:1});
  }

  function reuse(view) {
    // Each dot is a probe of its own profile on the same request head.
    view.querySelectorAll(".active-profile .probe-scale i").forEach(dot =>
      segment(dot, .10, .16, {opacity:0}, {opacity:1}));
    view.querySelectorAll(".probe-candidates .probe-scale i").forEach(dot =>
      segment(dot, .375, .485, {opacity:0}, {opacity:1}));
    const socket = view.querySelector(".reuse-socket");
    segment(socket.querySelector(".card-a"), .62, .68,
      {opacity:1, transform:"none"}, {opacity:0, transform:"translateY(2px) scale(.9)"});

    // The travel distance is the candidate group's height plus the difference in
    // padding. Percentage transforms keep both endpoints aligned on resize.
    const atSource = "translateY(0)";
    const atSlot = "translateY(calc(100% + var(--slot-pad) - var(--probe-pad)))";
    track(view.querySelector(".reuse-flight"), [
      {offset:0, opacity:0, transform:atSource}, {offset:.56, opacity:0, transform:atSource},
      {offset:.57, opacity:1, transform:atSource, easing:"cubic-bezier(.4,0,.2,1)"},
      {offset:.69, opacity:1, transform:atSlot}, {offset:.70, opacity:0, transform:atSlot},
      {offset:1, opacity:0, transform:atSlot}
    ]);
    segment(socket.querySelector(".card-b"), .685, .69, {opacity:0}, {opacity:1});
    const full = {opacity:1}, hidden = {opacity:0};
    segment(view.querySelector(".status-initial"), .54, .56, full, hidden);
    track(view.querySelector(".status-loading"), [
      {offset:0, opacity:0}, {offset:.56, opacity:0}, {offset:.59, opacity:1},
      {offset:.69, opacity:1}, {offset:.72, opacity:0}, {offset:1, opacity:0}
    ]);
    segment(view.querySelector(".status-restored"), .72, .75, hidden, full);
    segment(view.querySelector(".reuse-module"), .69, .74, {color:"#8293a2"}, {color:"#39775f"});
  }

  const draw = {decode, adapt, reuse};
  function stopChapterFrames() {
    if (chapterFrame !== null) window.cancelAnimationFrame(chapterFrame);
    chapterFrame = null;
  }

  function renderChapter(progress) {
    const chapter = buttons[selected].dataset.chapter;
    if (!example) {
      renderModel(chapter, progress);
    } else if (chapter === "reuse") {
      // The head is measured first. Select B after all same-head probes arrive.
      const view = views[selected];
      let beat = "monitor";
      if (progress >= .54) beat = "match";
      else if (progress >= .36) beat = "probe";
      else if (progress >= .20) beat = "shift";
      if (view.dataset.beat !== beat) view.dataset.beat = beat;
    }
  }

  function updateChapter() {
    chapterFrame = null;
    if (!clock || clock.playState !== "running") return;
    renderChapter(Math.min(1, clock.currentTime / duration));
    chapterFrame = window.requestAnimationFrame(updateChapter);
  }

  function dispose() {
    stopChapterFrames();
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
    renderChapter(fraction);
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
    stopChapterFrames();
    if (running && clock && (!example || buttons[selected].dataset.chapter === "reuse")) {
      chapterFrame = window.requestAnimationFrame(updateChapter);
    }
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
  let savedPosition = 0;
  window.addEventListener("beforeprint", () => {
    if (printing) return;
    printing = true;
    savedPosition = clock?.currentTime || 0;
    dispose();
    if (!example) renderModel(buttons[selected].dataset.chapter, 1);
    figure.querySelector("#film-reuse").dataset.beat = "match";
    delete figure.dataset.choreography;
    views.forEach(view => view.removeAttribute("aria-hidden"));
  });
  window.addEventListener("afterprint", () => {
    printing = false;
    if (supported) figure.dataset.choreography = "";
    present(selected, savedPosition / duration);
  });
})();
