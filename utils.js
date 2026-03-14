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
export const defaultButtonsConfig = [
{ id: 'newTab', label: 'New Tab', visible: true },
{ id: 'closeCurrent', label: 'Close Current', visible: true },
{ id: 'closeRight', label: 'Close Right', visible: true },
{ id: 'closeOthers', label: 'Close Others', visible: true },
{ id: 'duplicateTab', label: 'Duplicate Tab', visible: true },
{ id: 'removeDuplicates', label: 'Remove Duplicates', visible: true },
{ id: 'pinUnpin', label: 'Pin/Unpin', visible: true },
{ id: 'bookmarkAll', label: 'Bookmark All', visible: true },
{ id: 'suspendTabs', label: 'Suspend Tabs', visible: true },
{ id: 'muteTab', label: 'Mute Tab', visible: true },
{ id: 'muteOthers', label: 'Mute Others', visible: true },
{ id: 'undoClose', label: 'Undo Close', visible: true }
];
export const SlimeDefaults = Object.freeze({
badgeColor: '',
fontWeight: 'normal',
bgColor: '',
transparent: false,
popupBg: '',
popupText: '',
iconSize: 48,
btnUndo: '#E0BBE4',
btnDuplicate: '#B7D3DF',
btnMute: '#B8E6D5',
btnCloseOthers: '#FEC8D8',
btnCloseRight: '#AC7D88',
btnRemoveDuplicates: '#957DAD',
btnSettings: '#a78bfa',
btnNewTab: '#D6EFED',
btnCloseCurrent: '#85586F',
btnPinUnpin: '#F8ECD1',
btnBookmarkAll: '#DEB6AB',
btnSuspendTabs: '#C9BBCF',
btnMuteOthers: '#898AA6',
buttonsConfig: defaultButtonsConfig,
btnTransparent: true,
tabCubeColor: '#FFB786',
tabCubePlusColor: '#FF8E8E',
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
tabCubeColor: '#FFB786',
tabCubePlusColor: '#FF8E8E',
badgeColor: '#1e293b',
bgColor: '#f8fafc'
},
dark: {
popupBg: '#0f0f0f',
popupText: '#e0e0e0',
slimeOutline: '#ffffff',
tabCubeColor: '#FFB786',
tabCubePlusColor: '#FF8E8E',
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
