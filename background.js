'use strict';
const canvas = document.createElement('canvas');
canvas.width = 48;
canvas.height = 48;
const ctx = canvas.getContext('2d');
let badgeTimeout = null;
let isUpdating = false;

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

async function updateBadge() {
if (isUpdating) return;
clearTimeout(badgeTimeout);
badgeTimeout = setTimeout(async () => {
isUpdating = true;
try {
const tabs = await browser.tabs.query({ currentWindow: true });
const count = tabs.length;
const rawSettings = await browser.storage.local.get({
badgeColor: '',
fontWeight: 'bold',
bgColor: '',
transparent: false,
iconSize: 48,
theme: ''
});
const theme = rawSettings.theme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
const themeData = {
light: { badgeColor: '#1e293b', bgColor: '#f8fafc' },
dark: { badgeColor: '#e0e0e0', bgColor: '#0f0f0f' }
}[theme];
const settings = {
...rawSettings,
badgeColor: rawSettings.badgeColor || themeData.badgeColor,
bgColor: rawSettings.bgColor || themeData.bgColor
};
ctx.clearRect(0, 0, 48, 48);
if (!settings.transparent) {
ctx.fillStyle = settings.bgColor;
drawRoundedRect(ctx, 0, 0, 48, 48, 8);
ctx.fill();
}
const baseSize = settings.iconSize || 48;
const digitCount = count.toString().length;
let fontSize = baseSize;
if (digitCount >= 3) {
fontSize = Math.min(baseSize, 26);
} else if (digitCount === 2) {
fontSize = Math.min(baseSize, 40);
}
fontSize = Math.max(16, Math.min(48, fontSize));
ctx.fillStyle = settings.badgeColor;
ctx.font = `${settings.fontWeight} ${fontSize}px 'Arial Narrow', 'Roboto Condensed', 'Segoe UI Condensed', Arial, sans-serif`;
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText(count.toString(), 24, 24 + fontSize * 0.08);
if (browser.action && browser.action.setIcon) {
browser.action.setIcon({ imageData: ctx.getImageData(0, 0, 48, 48) });
}
} catch (error) {
console.error('Slime Tabs Lord: Badge update failed', error);
} finally {
isUpdating = false;
}
}, 150);
}

browser.tabs.onCreated.addListener(updateBadge);
browser.tabs.onRemoved.addListener(updateBadge);
browser.tabs.onActivated.addListener(updateBadge);
browser.windows.onFocusChanged.addListener(updateBadge);
browser.storage.onChanged.addListener((changes, area) => {
if (area !== 'local') return;
if (changes.theme || changes.badgeColor || changes.bgColor || changes.transparent || changes.iconSize) {
updateBadge();
}
});
browser.runtime.onMessage.addListener((message) => {
if (message.action === 'updateBadge') {
updateBadge();
}
});
browser.runtime.onInstalled.addListener(async () => {
const settings = await browser.storage.local.get('theme');
if (!settings.theme) {
const theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
const themeData = {
light: { badgeColor: '#1e293b', bgColor: '#f8fafc', popupBg: '#f8fafc', popupText: '#1e293b', slimeOutline: '#334155', tabCubeColor: '#FFB786', tabCubePlusColor: '#FF8E8E' },
dark: { badgeColor: '#e0e0e0', bgColor: '#0f0f0f', popupBg: '#0f0f0f', popupText: '#e0e0e0', slimeOutline: '#ffffff', tabCubeColor: '#FFB786', tabCubePlusColor: '#FF8E8E' }
}[theme];
await browser.storage.local.set({ theme, ...themeData });
}
updateBadge();
});

updateBadge();
