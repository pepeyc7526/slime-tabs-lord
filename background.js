// Slime Tabs Lord - Background Script
// Handles tab count badge rendering with optimized canvas

// Reusable canvas (created once, not per event)
const canvas = document.createElement('canvas');
canvas.width = 48;
canvas.height = 48;
const ctx = canvas.getContext('2d');

// Debounce timer to prevent rapid updates
let badgeTimeout = null;
let isUpdating = false;

// Safe roundRect with fallback
function drawRoundedRect(ctx, x, y, width, height, radius) {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, width, height, radius);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}

// Calculate precise vertical center for text
function getCenteredY(ctx, text, fontSize, canvasHeight) {
  const metrics = ctx.measureText(text);
  const ascent = metrics.actualBoundingBoxAscent || fontSize * 0.8;
  const descent = metrics.actualBoundingBoxDescent || fontSize * 0.2;
  const textHeight = ascent + descent;
  return (canvasHeight / 2) + ((ascent - descent) / 2);
}

// Debounced badge update
async function updateBadge() {
  if (isUpdating) return;
  
  clearTimeout(badgeTimeout);
  badgeTimeout = setTimeout(async () => {
    isUpdating = true;
    
    try {
      const tabs = await browser.tabs.query({ currentWindow: true });
      const count = tabs.length;
      
      const settings = await browser.storage.local.get({
        badgeColor: '#cccccc',
        fontWeight: 'bold',
        bgColor: '#111111',
        transparent: false,
        fontSize: 42
      });
      
      // Clear and redraw
      ctx.clearRect(0, 0, 48, 48);
      
      // Draw background if not transparent
      if (!settings.transparent) {
        ctx.fillStyle = settings.bgColor;
        drawRoundedRect(ctx, 0, 0, 48, 48, 8);
        ctx.fill();
      }
      
      // Clamp font size (20-64px)
      const fontSize = Math.max(20, Math.min(64, settings.fontSize || 42));
      const text = count.toString();
      
      // Draw centered text using measureText
      ctx.fillStyle = settings.badgeColor;
      ctx.font = `${settings.fontWeight} ${fontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      
      const centerY = getCenteredY(ctx, text, fontSize, 48);
      ctx.fillText(text, 24, centerY);
      
      // Use browserAction.setIcon (Firefox API)
      if (browser.browserAction && browser.browserAction.setIcon) {
        browser.browserAction.setIcon({ imageData: ctx.getImageData(0, 0, 48, 48) });
      }
    } catch (error) {
      console.error('Slime Tabs Lord: Badge update failed', error);
    } finally {
      isUpdating = false;
    }
  }, 150); // 150ms debounce
}

// Event listeners
browser.tabs.onCreated.addListener(updateBadge);
browser.tabs.onRemoved.addListener(updateBadge);
browser.tabs.onActivated.addListener(updateBadge);
browser.windows.onFocusChanged.addListener(updateBadge);

// Message listener
browser.runtime.onMessage.addListener((message) => {
  if (message.action === 'updateBadge') {
    updateBadge();
    return true;
  }
});

// Initialize on install
browser.runtime.onInstalled.addListener(updateBadge);
