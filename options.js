'use strict';
import { SlimeDefaults, SlimeConfig, SlimeThemes, getSystemTheme, applyThemeToSettings, getEl, defaultButtonsConfig } from './utils.js';

let currentTheme = 'dark';
let dragSrcEl = null;

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

const addDragEvents = (item) => {
item.addEventListener('dragstart', handleDragStart);
item.addEventListener('dragenter', handleDragEnter);
item.addEventListener('dragover', handleDragOver);
item.addEventListener('dragleave', handleDragLeave);
item.addEventListener('drop', handleDrop);
item.addEventListener('dragend', handleDragEnd);
};

const handleDragStart = function(e) {
dragSrcEl = this;
e.dataTransfer.effectAllowed = 'move';
this.classList.add('dragging');
};

const handleDragOver = function(e) {
if (e.preventDefault) e.preventDefault();
e.dataTransfer.dropEffect = 'move';
return false;
};

const handleDragEnter = function() {
this.classList.add('over');
};

const handleDragLeave = function() {
this.classList.remove('over');
};

const handleDrop = function(e) {
if (e.stopPropagation) e.stopPropagation();
if (dragSrcEl !== this) {
const list = getEl('buttonsList');
const items = Array.from(list.children);
const srcIndex = items.indexOf(dragSrcEl);
const targetIndex = items.indexOf(this);
if (srcIndex < targetIndex) {
list.insertBefore(dragSrcEl, this.nextSibling);
} else {
list.insertBefore(dragSrcEl, this);
}
}
return false;
};

const handleDragEnd = function() {
this.classList.remove('dragging');
document.querySelectorAll('.button-list-item').forEach(item => {
item.classList.remove('over');
});
};

const renderButtonsList = (config) => {
const list = getEl('buttonsList');
if (!list) return;
list.innerHTML = '';

config.forEach((btn) => {
const item = document.createElement('div');
item.className = 'button-list-item';
item.draggable = true;
item.dataset.id = btn.id;

const handle = document.createElement('span');
handle.className = 'drag-handle';
handle.textContent = '☰';

const label = document.createElement('label');
label.textContent = btn.label;

const checkbox = document.createElement('input');
checkbox.type = 'checkbox';
checkbox.checked = btn.visible;
checkbox.addEventListener('change', (e) => {
btn.visible = e.target.checked;
});

item.appendChild(handle);
item.appendChild(label);
item.appendChild(checkbox);

addDragEvents(item);
list.appendChild(item);
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
setValue('btnNewTab', settings.btnNewTab);
setValue('btnCloseCurrent', settings.btnCloseCurrent);
setValue('btnPinUnpin', settings.btnPinUnpin);
setValue('btnBookmarkAll', settings.btnBookmarkAll);
setValue('btnSuspendTabs', settings.btnSuspendTabs);
setValue('btnMuteOthers', settings.btnMuteOthers);

setChecked('btnTransparent', settings.btnTransparent);
setValue('tabCubeColor', settings.tabCubeColor);
setValue('tabCubePlusColor', settings.tabCubePlusColor);
setValue('slimeOutline', settings.slimeOutline);
setChecked('slimeOutlineEnabled', settings.slimeOutlineEnabled);
setChecked('closePopup', settings.closePopup);

const btnConfig = settings.buttonsConfig || defaultButtonsConfig;
renderButtonsList(btnConfig);
};

const saveSettings = async () => {
const list = getEl('buttonsList');
const items = Array.from(list.children);
const currentConfig = items.map(it => {
const id = it.dataset.id;
const original = defaultButtonsConfig.find(b => b.id === id);
return {
id: id,
label: original ? original.label : 'Unknown',
visible: it.querySelector('input').checked
};
});

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
btnNewTab: getEl('btnNewTab')?.value,
btnCloseCurrent: getEl('btnCloseCurrent')?.value,
btnPinUnpin: getEl('btnPinUnpin')?.value,
btnBookmarkAll: getEl('btnBookmarkAll')?.value,
btnSuspendTabs: getEl('btnSuspendTabs')?.value,
btnMuteOthers: getEl('btnMuteOthers')?.value,
buttonsConfig: currentConfig,
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

const exportSettings = async () => {
const settings = await browser.storage.local.get(null);
delete settings['theme'];
const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings, null, 2));
const downloadAnchorNode = document.createElement('a');
downloadAnchorNode.setAttribute("href", dataStr);
downloadAnchorNode.setAttribute("download", "slime-tabs-lord-settings.json");
document.body.appendChild(downloadAnchorNode);
downloadAnchorNode.click();
downloadAnchorNode.remove();
showMessage('Settings exported!', 'success');
};

const importSettings = async (event) => {
const file = event.target.files[0];
if (!file) return;
const reader = new FileReader();
reader.onload = async (e) => {
try {
const importedSettings = JSON.parse(e.target.result);
await browser.storage.local.set(importedSettings);
await loadSettings();
showMessage('Settings imported!', 'success');
} catch (err) {
showMessage('Invalid file!', 'error');
}
};
reader.readAsText(file);
event.target.value = '';
};

const selectAllVisibility = () => {
const items = getEl('buttonsList').children;
Array.from(items).forEach(it => it.querySelector('input').checked = true);
};

const deselectAllVisibility = () => {
const items = getEl('buttonsList').children;
Array.from(items).forEach(it => it.querySelector('input').checked = false);
};

getEl('save')?.addEventListener('click', saveSettings);
getEl('reset')?.addEventListener('click', resetSettings);
getEl('exportSettings')?.addEventListener('click', exportSettings);
getEl('importFile')?.addEventListener('change', importSettings);
getEl('selectAllVisibility')?.addEventListener('click', selectAllVisibility);
getEl('deselectAllVisibility')?.addEventListener('click', deselectAllVisibility);

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
