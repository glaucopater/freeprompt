// Debug panel for smartphone debugging
// Displays debug messages directly in the UI

const MAX_MESSAGES = 20;
let messageCount = 0;

function createDebugPanel(): HTMLDivElement {
  const panel = document.createElement('div');
  panel.id = 'debug-panel';
  panel.style.cssText = `
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    max-height: 200px;
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.9);
    color: #fff;
    font-family: monospace;
    font-size: 11px;
    padding: 8px;
    z-index: 10000;
    border-top: 2px solid #ff6b6b;
    display: none;
  `;
  
  const toggleBtn = document.createElement('button');
  toggleBtn.textContent = '🐛 Debug';
  toggleBtn.style.cssText = `
    position: fixed;
    bottom: 10px;
    right: 10px;
    z-index: 10001;
    padding: 8px 12px;
    background: #ff6b6b;
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-size: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  `;
  
  toggleBtn.addEventListener('click', () => {
    const isVisible = panel.style.display !== 'none';
    panel.style.display = isVisible ? 'none' : 'block';
    toggleBtn.textContent = isVisible ? '🐛 Debug' : '✕ Close';
  });
  
  document.body.appendChild(toggleBtn);
  document.body.appendChild(panel);
  
  return panel;
}

let debugPanel: HTMLDivElement | null = null;

function getDebugPanel(): HTMLDivElement {
  if (!debugPanel) {
    debugPanel = createDebugPanel();
  }
  return debugPanel;
}

export function addDebugMessage(prefix: string, message: string, data?: unknown) {
  const panel = getDebugPanel();
  const messageEl = document.createElement('div');
  messageEl.style.cssText = `
    padding: 4px 0;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    word-break: break-word;
  `;
  
  const timestamp = new Date().toLocaleTimeString();
  const prefixEl = document.createElement('span');
  prefixEl.textContent = `[${timestamp}] ${prefix}: `;
  prefixEl.style.color = prefix.includes('SW') ? '#4ecdc4' : '#ffe66d';
  
  const messageText = document.createElement('span');
  messageText.textContent = message;
  
  messageEl.appendChild(prefixEl);
  messageEl.appendChild(messageText);
  
  if (data) {
    const dataEl = document.createElement('div');
    dataEl.style.cssText = 'margin-left: 20px; color: #95e1d3; font-size: 10px;';
    dataEl.textContent = JSON.stringify(data, null, 2).substring(0, 200);
    messageEl.appendChild(dataEl);
  }
  
  panel.appendChild(messageEl);
  messageCount++;
  
  // Keep only last MAX_MESSAGES
  if (messageCount > MAX_MESSAGES) {
    panel.removeChild(panel.firstChild!);
    messageCount--;
  }
  
  // Auto-scroll to bottom
  panel.scrollTop = panel.scrollHeight;
  
  // Show panel if hidden (first message)
  if (panel.style.display === 'none' && messageCount === 1) {
    const toggleBtn = document.querySelector('button[style*="position: fixed"][style*="bottom: 10px"]') as HTMLButtonElement;
    if (toggleBtn) {
      toggleBtn.style.background = '#ff6b6b';
      toggleBtn.textContent = `🐛 Debug (${messageCount})`;
    }
  }
}

export function clearDebugMessages() {
  const panel = getDebugPanel();
  panel.innerHTML = '';
  messageCount = 0;
}
