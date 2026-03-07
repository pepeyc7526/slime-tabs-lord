'use strict';

// Глобальные переменные для Manifest V2
window.SlimeConfig = Object.freeze({
  CANVAS_SIZE: 16,
  BADGE_RADIUS: 3,
  FONT_SIZE: 14,
  FONT_SIZE_100PLUS: 11,
  DEBOUNCE_MS: 150,
  CENTER_X: 8,
  CENTER_Y: 9,
  CACHE_DURATION: 300,
  MAX_TAB_CUBES: 4,
  BLINK_MIN_DELAY: 8000,
  BLINK_MAX_DELAY: 16000,
  BLINK_DURATION: 150,
  ANIMATION_DELAY: 100,
  CUBE_FLY_DELAY: 200,
  CUBE_REMOVE_DELAY: 50,
  HAPPY_DURATION: 500,
  CLOSE_POPUP_DELAY: 300,
  TAB_CLOSE_WAIT: 300,
  MESSAGE_TIMEOUT: 2000
});

window.SlimeDefaults = Object.freeze({
  badgeColor: '#cccccc',
  fontWeight: 'normal',
  bgColor: '#111111',
  transparent: false,
  popupBg: '#111111',
  popupText: '#cccccc',
  btnCloseOthers: '#ef4444',
  btnCloseRight: '#f59e0b',
  btnSettings: '#64748b',
  btnTransparent: true,
  slimeOutline: '#ffffff',
  slimeOutlineEnabled: true,
  closePopup: false
});

window.getEl = (id) => {
  const el = document.getElementById(id);
  if (!el) console.warn(`Slime Tabs Lord: Element #${id} not found`);
  return el;
};

window.sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

window.isValidHexColor = (color) => /^#[0-9A-Fa-f]{6}$/.test(color);
