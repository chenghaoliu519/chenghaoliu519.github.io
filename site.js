"use strict";

// The page, navigation, and paper summary work without JavaScript.
const copyButton = document.querySelector("#copy-email");
const copyStatus = document.querySelector("#copy-status");
if (copyButton && copyStatus && navigator.clipboard && window.isSecureContext) {
  copyButton.hidden = false;
  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText("cxl5192@mavs.uta.edu");
      copyStatus.textContent = "Email address copied.";
    } catch {
      copyStatus.textContent = "Please select and copy the address above.";
    }
  });
}

// Highlight the section in view without intercepting standard anchor navigation.
const navigationLinks = Array.from(document.querySelectorAll("nav a"));
if ("IntersectionObserver" in window) {
  const visibleSections = new Map();
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      visibleSections.set(entry.target.id, entry.isIntersecting);
    }
    const current = navigationLinks.find((link) => visibleSections.get(link.hash.slice(1)));
    for (const link of navigationLinks) {
      if (link === current) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    }
  }, { rootMargin: "-18% 0px -48% 0px" });
  for (const link of navigationLinks) {
    const section = document.querySelector(link.hash);
    if (section) observer.observe(section);
  }
}
