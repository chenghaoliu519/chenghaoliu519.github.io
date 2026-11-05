"use strict";

// The page, navigation, and paper summary work without JavaScript.
const copyButton = document.querySelector("#copy-email");
const copyStatus = document.querySelector("#copy-status");
const emailLink = document.querySelector(".contact-email");
if (copyButton && copyStatus && emailLink && navigator.clipboard && window.isSecureContext) {
  copyButton.hidden = false;
  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(emailLink.getAttribute("href").replace(/^mailto:/, ""));
      copyStatus.textContent = "Email address copied.";
    } catch {
      copyStatus.textContent = "Please select and copy the address above.";
    }
  });
}

// A second close control keeps long research details easy to leave on mobile.
const researchDetails = document.querySelector(".paper-summary");
const detailsSummary = researchDetails?.querySelector("summary");
const closeDetails = researchDetails?.querySelector(".details-close");
if (detailsSummary && closeDetails) {
  closeDetails.hidden = false;
  closeDetails.addEventListener("click", () => {
    researchDetails.open = false;
    detailsSummary.focus({ preventScroll: true });
    detailsSummary.scrollIntoView({
      block: "start",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  });
}

// Enhance the research links into mutually exclusive, keyboard-accessible tabs.
const researchTabs = document.querySelector(".research-tabs");
const researchViews = Array.from(researchTabs?.querySelectorAll("a") || [])
  .map((tab) => ({ tab, panel: document.getElementById(tab.hash.slice(1)) }))
  .filter(({ panel }) => panel);

if (researchTabs && researchViews.length) {
  researchTabs.setAttribute("role", "tablist");
  for (const { tab, panel } of researchViews) {
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", panel.id);
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", tab.id);
    panel.tabIndex = 0;
  }

  function selectResearchView(view, { focus = false, scroll = false } = {}) {
    for (const item of researchViews) {
      const active = item === view;
      item.panel.hidden = !active;
      item.tab.setAttribute("aria-selected", String(active));
      item.tab.tabIndex = active ? 0 : -1;
    }
    if (focus) view.tab.focus({ preventScroll: true });
    if (scroll) view.panel.scrollIntoView({ block: "start", behavior: "instant" });
  }

  function revealLinkedResearchView() {
    let target;
    try {
      target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    } catch { return; }
    const view = researchViews.find(({ panel }) => panel === target || panel.contains(target));
    if (!view) return;
    selectResearchView(view);
    for (let details = target.closest("details"); details; details = details.parentElement?.closest("details")) {
      details.open = true;
    }
    requestAnimationFrame(() => target.scrollIntoView({ block: "start", behavior: "instant" }));
  }

  for (const [index, view] of researchViews.entries()) {
    view.tab.addEventListener("click", (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      selectResearchView(view, { scroll: true });
    });
    view.tab.addEventListener("keydown", (event) => {
      let next;
      if (event.key === "ArrowRight") next = (index + 1) % researchViews.length;
      else if (event.key === "ArrowLeft") next = (index + researchViews.length - 1) % researchViews.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = researchViews.length - 1;
      else if (event.key === " ") next = index;
      else return;
      event.preventDefault();
      selectResearchView(researchViews[next], { focus: true, scroll: true });
    });
  }

  // Start collapsed, including restored pages and URLs left by older tab navigation.
  function resetResearchDetails() {
    let target;
    try {
      target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    } catch { /* An unrelated or malformed fragment must not affect the default. */ }
    if (target && researchDetails?.contains(target)) {
      history.replaceState(history.state, "", location.pathname + location.search);
    }
    if (researchDetails) {
      researchDetails.open = false;
      for (const details of researchDetails.querySelectorAll("details")) details.open = false;
    }
    selectResearchView(researchViews[0]);
  }

  resetResearchDetails();
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) resetResearchDetails();
  });
  window.addEventListener("hashchange", revealLinkedResearchView);
}

// Track native scrolling, including short final sections that cannot reach the
// top of the viewport. Use the same offset as the page's anchor navigation.
const navigationItems = Array.from(document.querySelectorAll(".site-header nav a"))
  .map((link) => ({ link, section: document.querySelector(link.hash) }))
  .filter(({ section }) => section);
let navigationFrame = null;

function updateActiveNavigation() {
  navigationFrame = null;
  const root = document.documentElement;
  const activationLine = (parseFloat(getComputedStyle(root).scrollPaddingTop) || 0) + 2;
  const atBottom = window.scrollY > 0 && window.scrollY + window.innerHeight >= root.scrollHeight - 2;
  let current = atBottom ? navigationItems[navigationItems.length - 1] : undefined;
  if (!atBottom) {
    for (const item of navigationItems) {
      if (item.section.getBoundingClientRect().top <= activationLine) current = item;
    }
  }
  for (const item of navigationItems) {
    if (item === current) item.link.setAttribute("aria-current", "location");
    else item.link.removeAttribute("aria-current");
  }
}

function scheduleNavigationUpdate() {
  if (navigationFrame === null) navigationFrame = requestAnimationFrame(updateActiveNavigation);
}

window.addEventListener("scroll", scheduleNavigationUpdate, { passive: true });
window.addEventListener("resize", scheduleNavigationUpdate);
window.addEventListener("hashchange", scheduleNavigationUpdate);
window.addEventListener("load", scheduleNavigationUpdate);
researchDetails?.addEventListener("toggle", scheduleNavigationUpdate);
if ("ResizeObserver" in window) new ResizeObserver(scheduleNavigationUpdate).observe(document.body);
scheduleNavigationUpdate();
