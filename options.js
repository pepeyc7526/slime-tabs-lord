'use strict';

const setValue = (id, value) => { const el = window.getEl(id); if (el) el.value = value; };
const setChecked = (id, value) => { const el = window.getEl(id); if (el) el.checked = value; };
const showMessage = (text, className) => {
  const msg = window.getEl('message');
  if (!msg) return;
  msg.textContent = text;
  msg.className = `message ${className}`;
  setTimeout(() => { msg.textContent = ''; msg.className = 'message'; }, window.SlimeConfig.MESSAGE_TIMEOUT);
};

const loadSettings = async () => {
  const settings = await browser.storage.local.get(window.SlimeDefaults);
  setValue('badgeColor', settings.badgeColor);
  setValue('fontWeight', settings.fontWeight);
  setValue('bgColor', settings.bgColor);
  setChecked('transparent', settings.transparent);
  setValue('popupBg', settings.popupBg);
  setValue('popupText', settings.popupText);
  setValue('btnCloseOthers', settings.btnCloseOthers);
  setValue('btnCloseRight', settings.btnCloseRight);
  setValue('btnSettings', settings.btnSettings);
  setChecked('btnTransparent', settings.btnTransparent);
  setValue('slimeOutline', settings.slimeOutline);
  setChecked('slimeOutlineEnabled', settings.slimeOutlineEnabled);
  setChecked('closePopup', settings.closePopup);
};

const saveSettings = async () => {
  const settings = {
    badgeColor: window.getEl('badgeColor')?.value,
    fontWeight: window.getEl('fontWeight')?.value,
    bgColor: window.getEl('bgColor')?.value,
    transparent: window.getEl('transparent')?.checked,
    popupBg: window.getEl('popupBg')?.value,
    popupText: window.getEl('popupText')?.value,
    btnCloseOthers: window.getEl('btnCloseOthers')?.value,
    btnCloseRight: window.getEl('btnCloseRight')?.value,
    btnSettings: window.getEl('btnSettings')?.value,
    btnTransparent: window.getEl('btnTransparent')?.checked,
    slimeOutline: window.getEl('slimeOutline')?.value,
    slimeOutlineEnabled: window.getEl('slimeOutlineEnabled')?.checked,
    closePopup: window.getEl('closePopup')?.checked
  };
  await browser.storage.local.set(settings);
  showMessage('Settings saved!', 'success');
};

const resetSettings = async () => {
  await browser.storage.local.set(window.SlimeDefaults);
  await loadSettings();
  showMessage('Settings reset!', 'warning');
};

window.getEl('save')?.addEventListener('click', saveSettings);
window.getEl('reset')?.addEventListener('click', resetSettings);
loadSettings();
