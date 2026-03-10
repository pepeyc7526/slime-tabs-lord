'use strict';
export const SlimeConfig = Object.freeze({
CANVAS_SIZE: 16,
BADGE_RADIUS: 3,
FONT_SIZE: 14,
FONT_SIZE_100PLUS: 11,
DEBOUNCE_MS: 150,
CENTER_X: 8,
CENTER_Y: 9,
CACHE_DURATION: 300,
MAX_TAB_CUBES: 6,
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
export const SlimeDefaults = Object.freeze({
badgeColor: '',
fontWeight: 'normal',
bgColor: '',
transparent: false,
popupBg: '',
popupText: '',
iconSize: 48,
btnUndo: '#fdba74',
btnDuplicate: '#a3a3a3',
btnMute: '#f5f5f5',
btnCloseOthers: '#f87171',
btnCloseRight: '#f9a8d4',
btnRemoveDuplicates: '#60a5fa',
btnSettings: '#a78bfa',
btnTransparent: true,
tabCubeColor: '#667eea',
tabCubePlusColor: '#764ba2',
slimeOutline: '',
slimeOutlineEnabled: true,
closePopup: false,
theme: ''
});
export const SlimeThemes = Object.freeze({
light: {
popupBg: '#f8fafc',
popupText: '#1e293b',
slimeOutline: '#334155',
tabCubeColor: '#5468ff',
tabCubePlusColor: '#6366f1',
badgeColor: '#1e293b',
bgColor: '#f8fafc'
},
dark: {
popupBg: '#0f0f0f',
popupText: '#e0e0e0',
slimeOutline: '#ffffff',
tabCubeColor: '#667eea',
tabCubePlusColor: '#764ba2',
badgeColor: '#e0e0e0',
bgColor: '#0f0f0f'
}
});
export const getSystemTheme = async () => {
try {
const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
return isDark ? 'dark' : 'light';
} catch (e) {
return 'light';
}
};
export const applyThemeToSettings = async (settings) => {
const theme = settings.theme || await getSystemTheme();
const themeData = SlimeThemes[theme];
return {
...settings,
popupBg: settings.popupBg || themeData.popupBg,
popupText: settings.popupText || themeData.popupText,
slimeOutline: settings.slimeOutline || themeData.slimeOutline,
tabCubeColor: settings.tabCubeColor || themeData.tabCubeColor,
tabCubePlusColor: settings.tabCubePlusColor || themeData.tabCubePlusColor,
badgeColor: settings.badgeColor || themeData.badgeColor,
bgColor: settings.bgColor || themeData.bgColor,
theme: theme
};
};
export const getEl = (id) => document.getElementById(id);
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
export const isValidHexColor = (color) => /^#[0-9A-Fa-f]{6}$/.test(color);
export const isAndroid = () => /Android/i.test(navigator.userAgent);
