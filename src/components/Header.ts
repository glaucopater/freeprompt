export const Header = (logo: string) => `<header class="site-header">
  <div class="logo-wrapper">
  <a href="/">
    <img src="${logo}" alt="FreePrompt" title="FreePrompt" class="logo" />
  </a>
  </div>
  <div class="header-content">
    <h2>Media classifier based on free LLM APIs</h2>
  </div>
  <div class="theme-toggle">
    <input type="checkbox" id="theme-toggle" class="theme-toggle-checkbox" />
    <label for="theme-toggle" class="theme-toggle-label" aria-label="Toggle dark mode">
      <span class="theme-toggle-icon">🌙</span>
      <span class="theme-toggle-icon">☀️</span>
    </label>
  </div>
</header>`;
