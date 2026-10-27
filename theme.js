// Apply the saved preference before styles paint, without an inline CSP exception.
(() => {
  const key = 'chenghao-theme';
  const root = document.documentElement;
  const valid = value => value === 'light' || value === 'dark';
  let preference = null;
  try {
    const saved = localStorage.getItem(key);
    if (valid(saved)) preference = saved;
  } catch { /* The toggle still works when browser storage is unavailable. */ }

  function apply() {
    const theme = preference || 'light';
    root.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#111214' : '#ffffff');
    const button = document.getElementById('theme-toggle');
    if (button) {
      button.setAttribute('aria-pressed', String(theme === 'dark'));
      button.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
      button.hidden = false;
    }
  }

  apply();
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('theme-toggle')?.addEventListener('click', () => {
      preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(key, preference); } catch { /* Keep this tab's choice. */ }
      apply();
    });
    apply();
  }, { once: true });
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    preference = valid(event.newValue) ? event.newValue : null;
    apply();
  });
})();
