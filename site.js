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

// Track native scrolling, including short final sections that cannot reach the
// top of the viewport. Use the same offset as the page's anchor navigation.
const navigationItems = Array.from(document.querySelectorAll("nav a"))
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
