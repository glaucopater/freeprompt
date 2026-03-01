export const Header = (logo: string) => `<header class="site-header">
  <div class="logo-wrapper">
    <img src="${logo}" alt="FreePrompt" title="FreePrompt" class="logo" />
  </div>
  <div class="header-content">
    <h2>Media classifier based on LLM API</h2>
  </div>
  <div class="theme-toggle">
    <input type="checkbox" id="theme-toggle" class="theme-toggle-checkbox" />
    <label for="theme-toggle" class="theme-toggle-label" aria-label="Toggle dark mode">
      <span class="theme-toggle-icon">🌙</span>
      <span class="theme-toggle-icon">☀️</span>
    </label>
  </div>
</header>`;
