export const Footer = (appDetails: { version: string }) => `<footer>
<div>
  <p>Disclaimer: Files are not permanently stored. </p>
  <p><a href="https://github.com/glaucopater/freeprompt"><i class="fa-brands fa-github"></i> Github</a></p>
  <p>Version ${appDetails.version}</p>
</div>
</footer>`;
