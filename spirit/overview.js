"use strict";

(() => {
  const figure = document.querySelector("[data-overview-demo]");
  if (!figure) return;

  const views = Array.from(figure.querySelectorAll(".film-scene"));
  const buttons = Array.from(figure.querySelectorAll("[data-chapter]"));
  const play = figure.querySelector(".film-play");
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const duration = 6800;
  const supported = typeof Element.prototype.animate === "function";
  let requested = supported && !motion.matches;
  let inView = false;
  let printing = false;
  let selected = 0;
  let tracks = [];
  let clock;
  let snapshot = !requested;

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

  function decode(view) {
    const proposals = Array.from(view.querySelectorAll("[data-proposals] .film-word"));
    const verified = Array.from(view.querySelectorAll("[data-verification] .film-word:not(.film-correction)"));
    const travel = proposals[0].getBoundingClientRect().top - verified[0].getBoundingClientRect().top;
    proposals.forEach((word, i) => {
      segment(word, .02 + i * .065, .15 + i * .065,
        {opacity:0, transform:"translate(-9px, 3px)"}, {opacity:1, transform:"none"});
    });
    verified.forEach(word => {
      segment(word, .34, .51,
        {opacity:0, transform:"translateY(" + travel + "px)"}, {opacity:1, transform:"none"});
    });
    const discard = view.querySelector(".film-discard");
    // Fade the rejected proposal separately from its arrival on the verifier.
    segment(discard.parentElement.querySelector(".film-correction"), .57, .68,
      {opacity:0, transform:"translateY(9px)"}, {opacity:1, transform:"none"});
    segment(discard, .54, .63, {clipPath:"inset(0 0 0 0)"}, {clipPath:"inset(0 0 100% 0)"});
    segment(view.querySelector(".film-check"), .67, .74,
      {opacity:0, transform:"scale(.65)"}, {opacity:1, transform:"scale(1)"});
    segment(view.querySelector(".film-phrase"), .74, .85,
      {opacity:0, transform:"translateY(-12px)"}, {opacity:1, transform:"none"});
    segment(view.querySelector(".film-corrected"), .82, .90, {opacity:0}, {opacity:1});
  }

  function adapt(view) {
    const coarse = view.querySelector(".film-coarse");
    const refined = view.querySelector(".film-refined");
    segment(coarse, .13, .24, {opacity:.15}, {opacity:1});
    segment(coarse.querySelector(".film-layer-overlay"), .30, .43,
      {opacity:1, transform:"translateX(200%)"}, {opacity:0, transform:"translateX(200%)"});
    segment(refined, .48, .59, {opacity:.10}, {opacity:1});
    segment(refined.querySelector(".film-layer-overlay"), .64, .81,
      {transform:"translateX(500%)"}, {transform:"translateX(300%)"});
  }

  function reuse(view) {
    const match = view.querySelector(".film-match");
    const restored = view.querySelector(".film-restored");
    const source = match.getBoundingClientRect();
    const destination = restored.getBoundingClientRect();
    const shiftX = source.x + source.width / 2 - destination.x - destination.width / 2;
    const shiftY = source.y + source.height / 2 - destination.y - destination.height / 2;
    const handoff = "translate(" + shiftX + "px," + shiftY + "px) scale(" +
      source.width / destination.width + "," + source.height / destination.height + ")";
    view.querySelectorAll(".film-signals span").forEach((signal, i) => {
      segment(signal, .02 + i * .07, .17 + i * .07,
        {opacity:.35, transform:"translateY(6px)"}, {opacity:1, transform:"none"});
    });
    view.querySelectorAll(".film-candidate").forEach(card =>
      segment(card, .37, .48, {opacity:1}, {opacity:.38}));
    segment(match, .30, .47, {filter:"saturate(0)", opacity:.72}, {filter:"none", opacity:1});
    segment(restored, .52, .77,
      {transform:handoff, opacity:0}, {transform:"none", opacity:1});
  }

  const draw = {decode, adapt, reuse};
  function dispose() {
    if (clock) clock.onfinish = null;
    tracks.forEach(track => track.cancel());
    tracks = [];
    clock = null;
  }

  function present(index, position) {
    dispose();
    selected = index;
    views.forEach((view, i) => view.setAttribute("aria-hidden", String(i !== selected)));
    buttons.forEach((button, i) => button.setAttribute("aria-pressed", String(i === selected)));
    if (supported && !printing) {
      const view = views[selected];
      draw[buttons[selected].dataset.chapter](view);
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
    play.dataset.playing = String(requested);
    play.setAttribute("aria-label", requested ? "Pause animation" : "Play animation");
    play.querySelector("[data-play-label]").textContent = requested ? "Pause" : "Play";
  }

  function choose(index) {
    snapshot = !requested;
    present(index, snapshot ? duration : 0);
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
  figure.querySelector(".film-toolbar").hidden = false;
  figure.dataset.enhanced = "";
  if (supported) figure.dataset.choreography = "";
  else play.hidden = true;
  present(0, snapshot ? duration : 0);
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
      present(selected, clock?.currentTime || 0);
    }).observe(figure);
  }

  let savedPosition = 0;
  window.addEventListener("beforeprint", () => {
    if (printing) return;
    printing = true;
    savedPosition = clock?.currentTime || 0;
    dispose();
    delete figure.dataset.choreography;
    views.forEach(view => view.removeAttribute("aria-hidden"));
  });
  window.addEventListener("afterprint", () => {
    printing = false;
    if (supported) figure.dataset.choreography = "";
    present(selected, savedPosition);
  });
})();
