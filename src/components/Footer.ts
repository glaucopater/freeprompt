export const Footer = (appDetails: { version: string }) => `<footer>
<div>
  <p>Disclaimer: Images are not stored. All images are processed in real-time and deleted immediately after processing.</p>
  <p><a href="https://github.com/glaucopater/freeprompt"><i class="fa-brands fa-github"></i> Github</a></p>
  <p>Version ${appDetails.version}</p>
</div>
</footer>`;
