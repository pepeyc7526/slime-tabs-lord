'use strict';
import { SlimeDefaults, SlimeConfig, SlimeThemes, getSystemTheme, applyThemeToSettings, getEl } from './utils.js';
let currentTheme = 'dark';
const setValue = (id, value) => {
const el = getEl(id);
if (el) el.value = value;
};
const setChecked = (id, value) => {
const el = getEl(id);
if (el) el.checked = value;
};
const showMessage = (text, className) => {
const msg = getEl('message');
if (!msg) return;
msg.textContent = text;
msg.className = `message ${className}`;
setTimeout(() => {
msg.textContent = '';
msg.className = 'message';
}, SlimeConfig.MESSAGE_TIMEOUT);
};
const applyThemeToPage = (theme) => {
const body = document.body;
if (theme === 'light') {
body.classList.remove('dark-theme');
body.classList.add('light-theme');
} else {
body.classList.remove('light-theme');
body.classList.add('dark-theme');
}
document.querySelectorAll('.theme-icon-btn').forEach(btn => {
btn.classList.remove('active');
if (btn.dataset.theme === theme) {
btn.classList.add('active');
}
});
};
const loadSettings = async () => {
let settings = await browser.storage.local.get(SlimeDefaults);
if (!settings.theme) {
const systemTheme = await getSystemTheme();
const themeData = SlimeThemes[systemTheme];
settings = {
...settings,
theme: systemTheme,
popupBg: themeData.popupBg,
popupText: themeData.popupText,
slimeOutline: themeData.slimeOutline,
tabCubeColor: themeData.tabCubeColor,
tabCubePlusColor: themeData.tabCubePlusColor,
badgeColor: themeData.badgeColor,
bgColor: themeData.bgColor
};
await browser.storage.local.set(settings);
} else {
settings = await applyThemeToSettings(settings);
}
currentTheme = settings.theme;
applyThemeToPage(currentTheme);
setValue('badgeColor', settings.badgeColor);
setValue('fontWeight', settings.fontWeight);
setValue('bgColor', settings.bgColor);
setChecked('transparent', settings.transparent);
setValue('popupBg', settings.popupBg);
setValue('popupText', settings.popupText);
setValue('iconSize', settings.iconSize);
const iconSizeValue = getEl('iconSizeValue');
if (iconSizeValue) iconSizeValue.textContent = `${settings.iconSize}%`;
setValue('btnUndo', settings.btnUndo);
setValue('btnDuplicate', settings.btnDuplicate);
setValue('btnMute', settings.btnMute);
setValue('btnCloseOthers', settings.btnCloseOthers);
setValue('btnCloseRight', settings.btnCloseRight);
setValue('btnRemoveDuplicates', settings.btnRemoveDuplicates);
setValue('btnSettings', settings.btnSettings);
setChecked('btnTransparent', settings.btnTransparent);
setValue('tabCubeColor', settings.tabCubeColor);
setValue('tabCubePlusColor', settings.tabCubePlusColor);
setValue('slimeOutline', settings.slimeOutline);
setChecked('slimeOutlineEnabled', settings.slimeOutlineEnabled);
setChecked('closePopup', settings.closePopup);
};
const saveSettings = async () => {
const settings = {
badgeColor: getEl('badgeColor')?.value,
fontWeight: getEl('fontWeight')?.value,
bgColor: getEl('bgColor')?.value,
transparent: getEl('transparent')?.checked,
popupBg: getEl('popupBg')?.value,
popupText: getEl('popupText')?.value,
iconSize: parseInt(getEl('iconSize')?.value) || 70,
btnUndo: getEl('btnUndo')?.value,
btnDuplicate: getEl('btnDuplicate')?.value,
btnMute: getEl('btnMute')?.value,
btnCloseOthers: getEl('btnCloseOthers')?.value,
btnCloseRight: getEl('btnCloseRight')?.value,
btnRemoveDuplicates: getEl('btnRemoveDuplicates')?.value,
btnSettings: getEl('btnSettings')?.value,
btnTransparent: getEl('btnTransparent')?.checked,
tabCubeColor: getEl('tabCubeColor')?.value,
tabCubePlusColor: getEl('tabCubePlusColor')?.value,
slimeOutline: getEl('slimeOutline')?.value,
slimeOutlineEnabled: getEl('slimeOutlineEnabled')?.checked,
closePopup: getEl('closePopup')?.checked,
theme: currentTheme
};
await browser.storage.local.set(settings);
showMessage('Settings saved!', 'success');
browser.runtime.sendMessage({ action: 'updateBadge' });
};
const resetSettings = async () => {
await browser.storage.local.set(SlimeDefaults);
currentTheme = await getSystemTheme();
await loadSettings();
showMessage('Settings reset!', 'warning');
};
const toggleTheme = async (newTheme) => {
currentTheme = newTheme;
applyThemeToPage(newTheme);
const themeData = SlimeThemes[newTheme];
await browser.storage.local.set({
theme: newTheme,
popupBg: themeData.popupBg,
popupText: themeData.popupText,
slimeOutline: themeData.slimeOutline,
tabCubeColor: themeData.tabCubeColor,
tabCubePlusColor: themeData.tabCubePlusColor,
badgeColor: themeData.badgeColor,
bgColor: themeData.bgColor
});
setValue('popupBg', themeData.popupBg);
setValue('popupText', themeData.popupText);
setValue('slimeOutline', themeData.slimeOutline);
setValue('tabCubeColor', themeData.tabCubeColor);
setValue('tabCubePlusColor', themeData.tabCubePlusColor);
setValue('badgeColor', themeData.badgeColor);
setValue('bgColor', themeData.bgColor);
showMessage(`Switched to ${newTheme} theme`, 'success');
};
getEl('save')?.addEventListener('click', saveSettings);
getEl('reset')?.addEventListener('click', resetSettings);
getEl('iconSize')?.addEventListener('input', (e) => {
const iconSizeValue = getEl('iconSizeValue');
if (iconSizeValue) iconSizeValue.textContent = `${e.target.value}%`;
});
document.querySelectorAll('.theme-icon-btn').forEach(btn => {
btn.addEventListener('click', () => {
const newTheme = btn.dataset.theme;
toggleTheme(newTheme);
});
});
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', async (e) => {
const stored = await browser.storage.local.get('theme');
if (!stored.theme) {
currentTheme = e.matches ? 'dark' : 'light';
applyThemeToPage(currentTheme);
}
});
loadSettings();
