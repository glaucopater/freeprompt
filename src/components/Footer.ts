export const Footer = (appDetails: { version: string }) => `<footer>
  <div style="display: flex; justify-content: center; align-items: center; gap: 2rem; flex-wrap: wrap;">
    <p>Disclaimer: Files are not permanently stored.</p>
    <div class="status-bar">
      <span class="text-muted">Status: </span>
      <span id="healthcheck-status">🔴</span>
    </div>
    <p><a href="https://github.com/glaucopater/freeprompt"><i class="fa-brands fa-github" aria-hidden="true"></i> Github</a></p>
    <p>Version ${appDetails.version}</p>
  </div>
</footer>`;
