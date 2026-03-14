'use strict';
import { SlimeConfig, SlimeDefaults, SlimeThemes, getSystemTheme, applyThemeToSettings, getEl, sleep, isAndroid, defaultButtonsConfig } from './utils.js';
import { SlimeFacts, getContextualFact, checkTripleTap } from './slime-facts.js';
(async () => {
const state = {
cachedData: null,
cacheTimestamp: 0,
closePopupAfterAction: false,
factTimeout: null,
slimeResetTimeout: null,
currentPage: 1
};
const isMobile = isAndroid();
const ensureThemeInitialized = async () => {
const settings = await browser.storage.local.get('theme');
if (!settings.theme) {
const systemTheme = await getSystemTheme();
const themeData = SlimeThemes[systemTheme];
await browser.storage.local.set({ theme: systemTheme, popupBg: themeData.popupBg, popupText: themeData.popupText, slimeOutline: themeData.slimeOutline, tabCubeColor: themeData.tabCubeColor, tabCubePlusColor: themeData.tabCubePlusColor, badgeColor: themeData.badgeColor, bgColor: themeData.bgColor });
}
};
const loadPageState = async () => {
const saved = await browser.storage.local.get('currentPage');
state.currentPage = saved.currentPage || 1;
};
const savePageState = async () => {
await browser.storage.local.set({ currentPage: state.currentPage });
};
await ensureThemeInitialized();
await loadPageState();
const getTabsData = async () => {
try {
const now = Date.now();
if (state.cachedData && (now - state.cacheTimestamp) < SlimeConfig.CACHE_DURATION) return state.cachedData;
const tabs = await browser.tabs.query({ currentWindow: true });
state.cachedData = tabs;
state.cacheTimestamp = now;
return tabs;
} catch (error) {
console.error('Slime Tabs Lord: Failed to get tabs', error);
return [];
}
};
const updateCount = async () => {
const tabs = await getTabsData();
const countEl = getEl('tabCount');
if (countEl) countEl.textContent = tabs.length;
createTabCubes(tabs.length);
return tabs;
};
const createTabCubes = (count) => {
const container = getEl('tabCubes');
if (!container) return;
container.innerHTML = '';
const regularCubes = Math.min(count, SlimeConfig.MAX_TAB_CUBES);
for (let i = 0; i < regularCubes; i++) {
const cube = document.createElement('div');
cube.className = 'tab-cube';
container.appendChild(cube);
}
if (count > SlimeConfig.MAX_TAB_CUBES) {
const plusCube = document.createElement('div');
plusCube.className = 'tab-cube plus';
plusCube.title = `${count - SlimeConfig.MAX_TAB_CUBES} more tabs`;
container.appendChild(plusCube);
}
};
const setSlimeColor = (color) => {
const slime = getEl('slime');
if (slime) color ? slime.setAttribute('data-color', color) : slime.removeAttribute('data-color');
};
const showBubble = (text, isButton = false) => {
const bubble = getEl('speechBubble');
if (!bubble) return;
if (state.factTimeout) { clearTimeout(state.factTimeout); state.factTimeout = null; }
bubble.textContent = text;
bubble.classList.toggle('is-button', isButton);
bubble.classList.add('visible');
};
const hideBubble = () => {
const bubble = getEl('speechBubble');
if (!bubble) return;
if (state.factTimeout) { clearTimeout(state.factTimeout); state.factTimeout = null; }
bubble.classList.remove('visible');
bubble.classList.remove('is-button');
};
const animateSlime = async (color) => {
const slime = getEl('slime');
const outline = getEl('slimeOutline');
if (!slime) return;
setSlimeColor(color);
await sleep(SlimeConfig.ANIMATION_DELAY);
outline?.classList.add('hidden');
slime.classList.add('eating');
const tabCubes = document.querySelectorAll('.tab-cube');
for (const cube of tabCubes) {
cube.classList.add('flying');
await sleep(SlimeConfig.CUBE_FLY_DELAY);
cube.remove();
await sleep(SlimeConfig.CUBE_REMOVE_DELAY);
}
slime.classList.remove('eating');
slime.classList.add('happy');
await sleep(SlimeConfig.HAPPY_DURATION);
slime.classList.remove('happy');
outline?.classList.remove('hidden');
};
const blinkSlime = async () => {
const slime = getEl('slime');
if (!slime || slime.classList.contains('eating') || slime.classList.contains('happy')) { setTimeout(blinkSlime, SlimeConfig.BLINK_MIN_DELAY); return; }
slime.classList.add('blink');
await sleep(SlimeConfig.BLINK_DURATION);
slime.classList.remove('blink');
const nextBlink = Math.random() * (SlimeConfig.BLINK_MAX_DELAY - SlimeConfig.BLINK_MIN_DELAY) + SlimeConfig.BLINK_MIN_DELAY;
setTimeout(blinkSlime, nextBlink);
};
const showSlimeFact = async (e) => {
if (checkTripleTap()) {
const easterEgg = SlimeFacts[SlimeFacts.length - 1];
showBubble(easterEgg, false);
state.factTimeout = setTimeout(() => { hideBubble(); }, 5000);
return;
}
const tabs = await getTabsData();
const fact = getContextualFact(tabs.length);
showBubble(fact, false);
state.factTimeout = setTimeout(() => { hideBubble(); }, 5000);
};
const renderButtons = (config) => {
const page1 = getEl('page1');
const page2 = getEl('page2');
const dots = document.querySelectorAll('.page-dot');
if (!page1 || !page2) return;
page1.innerHTML = '';
page2.innerHTML = '';
const visibleButtons = config.filter(b => b.visible);
visibleButtons.forEach((btnConfig, index) => {
const originalBtn = document.getElementById(btnConfig.id);
if (!originalBtn) return;
const clone = originalBtn.cloneNode(true);
clone.style.display = 'flex';
if (index < 6) {
page1.appendChild(clone);
} else {
page2.appendChild(clone);
}
});
const hasPage2 = visibleButtons.length > 6;
if (!hasPage2) {
dots.forEach(d => d.style.display = 'none');
state.currentPage = 1;
goToPage(1);
} else {
dots.forEach(d => d.style.display = 'block');
if (state.currentPage > 2) state.currentPage = 1;
goToPage(state.currentPage);
}
};
const applyPopupStyle = async () => {
let settings = await browser.storage.local.get(SlimeDefaults);
settings = await applyThemeToSettings(settings);
document.body.style.background = settings.popupBg;
document.body.style.color = settings.popupText;
document.documentElement.style.setProperty('--icon-size', `${settings.iconSize}%`);
document.documentElement.style.setProperty('--tab-cube-color', settings.tabCubeColor);
document.documentElement.style.setProperty('--tab-cube-plus-color', settings.tabCubePlusColor);
document.documentElement.style.setProperty('--btn-new-tab', settings.btnNewTab);
document.documentElement.style.setProperty('--btn-close-current', settings.btnCloseCurrent);
document.documentElement.style.setProperty('--btn-close-right', settings.btnCloseRight);
document.documentElement.style.setProperty('--btn-close-others', settings.btnCloseOthers);
document.documentElement.style.setProperty('--btn-duplicate', settings.btnDuplicate);
document.documentElement.style.setProperty('--btn-remove-duplicates', settings.btnRemoveDuplicates);
document.documentElement.style.setProperty('--btn-pin', settings.btnPinUnpin);
document.documentElement.style.setProperty('--btn-bookmark', settings.btnBookmarkAll);
document.documentElement.style.setProperty('--btn-suspend', settings.btnSuspendTabs);
document.documentElement.style.setProperty('--btn-mute', settings.btnMute);
document.documentElement.style.setProperty('--btn-mute-others', settings.btnMuteOthers);
document.documentElement.style.setProperty('--btn-undo', settings.btnUndo);
document.documentElement.style.setProperty('--btn-settings', settings.btnSettings);
const tabsInfo = getEl('tabsInfo');
if (tabsInfo) tabsInfo.style.color = settings.popupText;
const outlineEl = getEl('slimeOutline');
if (outlineEl) {
if (settings.slimeOutlineEnabled) { outlineEl.style.display = 'block'; outlineEl.style.border = `3px solid ${settings.slimeOutline}`; }
else { outlineEl.style.display = 'none'; }
}
document.querySelectorAll('.btn').forEach(btn => {
if (!settings.btnTransparent) btn.classList.add('btn-transparent');
else btn.classList.remove('btn-transparent');
});
const btnConfig = settings.buttonsConfig || defaultButtonsConfig;
renderButtons(btnConfig);
state.closePopupAfterAction = settings.closePopup;
};
const handleCloseAction = async (filterFn, color, nomText) => {
try {
const tabs = await getTabsData();
const currentTab = tabs.find(t => t.active);
const tabsToClose = tabs.filter(tab => filterFn(currentTab, tab)).map(tab => tab.id);
if (tabsToClose.length > 0) {
hideBubble();
await animateSlime(color);
await browser.tabs.remove(tabsToClose);
state.cachedData = null;
await updateCount();
showBubble(nomText, true);
await sleep(1500);
hideBubble();
if (state.closePopupAfterAction) { await sleep(SlimeConfig.CLOSE_POPUP_DELAY); window.close(); }
}
} catch (error) { console.error('Slime Tabs Lord: Failed to close tabs', error); }
};
const handleNewTab = async () => { try { await browser.tabs.create({}); showBubble('New tab opened', true); await sleep(1500); hideBubble(); await updateCount(); } catch (error) { showBubble('Something went wrong', true); await sleep(1500); hideBubble(); } };
const handleCloseCurrent = async () => { try { const tabs = await getTabsData(); const currentTab = tabs.find(t => t.active); if (currentTab) { hideBubble(); await animateSlime('warm-berry'); await browser.tabs.remove(currentTab.id); state.cachedData = null; await updateCount(); showBubble('Tab closed', true); await sleep(1500); hideBubble(); if (state.closePopupAfterAction) { await sleep(SlimeConfig.CLOSE_POPUP_DELAY); window.close(); } } } catch (error) { showBubble('Something went wrong', true); await sleep(1500); hideBubble(); } };
const handleUndoClose = async () => { try { const recentlyClosed = await browser.sessions.getRecentlyClosed({ maxResults: 1 }); if (recentlyClosed && recentlyClosed.length > 0) { await browser.sessions.restore(recentlyClosed[0].sessionId); showBubble('Tab restored', true); await sleep(1500); hideBubble(); await updateCount(); } else { showBubble('No tabs to restore', true); await sleep(1500); hideBubble(); } } catch (error) { showBubble('Something went wrong', true); await sleep(1500); hideBubble(); } };
const handleDuplicate = async () => { try { const tabs = await getTabsData(); const currentTab = tabs.find(t => t.active); if (currentTab) { await browser.tabs.duplicate(currentTab.id); showBubble('Tab duplicated', true); await sleep(1500); hideBubble(); await updateCount(); } } catch (error) { showBubble('Something went wrong', true); await sleep(1500); hideBubble(); } };
const handleMute = async () => { try { const tabs = await getTabsData(); const currentTab = tabs.find(t => t.active); if (currentTab) { await browser.tabs.update(currentTab.id, { muted: !currentTab.mutedInfo.muted }); const action = currentTab.mutedInfo.muted ? 'Unmuted' : 'Muted'; showBubble(action, true); await sleep(1500); hideBubble(); } } catch (error) { showBubble('Something went wrong', true); await sleep(1500); hideBubble(); } };
const handleMuteOthers = async () => { try { const tabs = await getTabsData(); const currentTab = tabs.find(t => t.active); if (!currentTab) return; const currentMuted = currentTab.mutedInfo.muted; const others = tabs.filter(t => t.id !== currentTab.id); const audibleOthers = others.filter(t => !t.mutedInfo.muted); const mutedOthers = others.filter(t => t.mutedInfo.muted); if (currentMuted) { for (const tab of others) await browser.tabs.update(tab.id, { muted: false }); await browser.tabs.update(currentTab.id, { muted: false }); showBubble('All tabs unmuted', true); } else if (audibleOthers.length > 0) { for (const tab of audibleOthers) await browser.tabs.update(tab.id, { muted: true }); showBubble(`Muted ${audibleOthers.length} tabs`, true); } else if (mutedOthers.length > 0) { for (const tab of mutedOthers) await browser.tabs.update(tab.id, { muted: false }); showBubble(`Unmuted ${mutedOthers.length} tabs`, true); } else { showBubble('No other tabs to mute', true); } await sleep(1500); hideBubble(); } catch (error) { showBubble('Something went wrong', true); await sleep(1500); hideBubble(); } };
const handleRemoveDuplicates = async () => { try { const tabs = await getTabsData(); const urlMap = new Map(); const duplicates = []; tabs.forEach(tab => { if (urlMap.has(tab.url)) duplicates.push(tab.id); else urlMap.set(tab.url, tab.id); }); if (duplicates.length > 0) { await animateSlime('lavender'); await browser.tabs.remove(duplicates); showBubble(`Removed ${duplicates.length} duplicates`, true); await sleep(1500); hideBubble(); await updateCount(); } else { showBubble('No duplicates found', true); await sleep(1500); hideBubble(); } } catch (error) { showBubble('Something went wrong', true); await sleep(1500); hideBubble(); } };
const handlePinUnpin = async () => { try { const tabs = await getTabsData(); const currentTab = tabs.find(t => t.active); if (currentTab) { await browser.tabs.update(currentTab.id, { pinned: !currentTab.pinned }); const action = currentTab.pinned ? 'Unpinned' : 'Pinned'; showBubble(action, true); await sleep(1500); hideBubble(); } } catch (error) { showBubble('Something went wrong', true); await sleep(1500); hideBubble(); } };
const handleBookmarkAll = async () => { try { const tabs = await browser.tabs.query({ currentWindow: true }); const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19); const folderName = `Slime Tabs Lord ${timestamp}`; const folder = await browser.bookmarks.create({ title: folderName }); let saved = 0; let skipped = 0; for (const tab of tabs) { if (tab.url) { const title = tab.title || tab.url; await browser.bookmarks.create({ parentId: folder.id, title: title, url: tab.url }); saved++; } else { skipped++; } } let message = `Saved ${saved} tabs`; if (skipped > 0) message += ` (${skipped} empty skipped)`; showBubble(message, true); await sleep(1500); hideBubble(); } catch (error) { showBubble('Something went wrong', true); await sleep(1500); hideBubble(); } };
const handleSuspendTabs = async () => { try { const tabs = await browser.tabs.query({ currentWindow: true, discarded: false }); if (tabs.length > 0) { for (const tab of tabs) await browser.tabs.discard(tab.id); showBubble(`Suspended ${tabs.length} tabs`, true); } else { showBubble('All tabs already suspended', true); } await sleep(1500); hideBubble(); } catch (error) { showBubble('Something went wrong', true); await sleep(1500); hideBubble(); } };
const scheduleSlimeReset = () => { if (state.slimeResetTimeout) clearTimeout(state.slimeResetTimeout); state.slimeResetTimeout = setTimeout(() => { setSlimeColor(null); hideBubble(); state.slimeResetTimeout = null; }, 2000); };
const cancelSlimeReset = () => { if (state.slimeResetTimeout) { clearTimeout(state.slimeResetTimeout); state.slimeResetTimeout = null; } };
const goToPage = (pageNum) => {
state.currentPage = pageNum;
const container = getEl('pagesContainer');
if (container) container.style.transform = `translateX(-${(pageNum - 1) * 50}%)`;
document.querySelectorAll('.page-dot').forEach(dot => {
dot.classList.toggle('active', parseInt(dot.dataset.page) === pageNum);
});
savePageState();
};
await applyPopupStyle();
await updateCount();
blinkSlime();
getEl('slime')?.addEventListener('click', showSlimeFact);
getEl('slime')?.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showSlimeFact(e); } });
getEl('openOptions')?.addEventListener('click', (e) => { e.preventDefault(); browser.runtime.openOptionsPage(); });
document.querySelectorAll('.page-dot').forEach(dot => { dot.addEventListener('click', () => { goToPage(parseInt(dot.dataset.page)); }); });
const handleButtonClick = (e) => {
const btn = e.target.closest('.btn');
if (!btn) return;
const id = btn.id;
if (id === 'newTab') handleNewTab();
else if (id === 'closeCurrent') handleCloseCurrent();
else if (id === 'closeRight') handleCloseAction((curr, tab) => tab.index > curr?.index, 'soft-raspberry', 'Burp! So good!');
else if (id === 'closeOthers') handleCloseAction((curr, tab) => tab.id !== curr?.id, 'candy-pink', 'Nom nom! Delicious!');
else if (id === 'duplicateTab') handleDuplicate();
else if (id === 'removeDuplicates') handleRemoveDuplicates();
else if (id === 'pinUnpin') handlePinUnpin();
else if (id === 'bookmarkAll') handleBookmarkAll();
else if (id === 'suspendTabs') handleSuspendTabs();
else if (id === 'muteTab') handleMute();
else if (id === 'muteOthers') handleMuteOthers();
else if (id === 'undoClose') handleUndoClose();
};
const handleButtonHover = (e) => {
const btn = e.target.closest('.btn');
if (!btn) return;
const id = btn.id;
cancelSlimeReset();
if (id === 'newTab') { setSlimeColor('pale-sea'); showBubble('Open new tab?', true); }
else if (id === 'closeCurrent') { setSlimeColor('warm-berry'); showBubble('Close current tab?', true); }
else if (id === 'closeRight') { setSlimeColor('soft-raspberry'); showBubble('Close tabs to the right?', true); }
else if (id === 'closeOthers') { setSlimeColor('candy-pink'); showBubble('Close all other tabs?', true); }
else if (id === 'duplicateTab') { setSlimeColor('sky-blue'); showBubble('Duplicate tab?', true); }
else if (id === 'removeDuplicates') { setSlimeColor('lavender'); showBubble('Remove duplicates?', true); }
else if (id === 'pinUnpin') { setSlimeColor('soft-yellow'); showBubble('Pin or unpin tab?', true); }
else if (id === 'bookmarkAll') { setSlimeColor('pale-orange'); showBubble('Bookmark all tabs?', true); }
else if (id === 'suspendTabs') { setSlimeColor('medium-lilac'); showBubble('Suspend all tabs?', true); }
else if (id === 'muteTab') { setSlimeColor('soft-mint'); showBubble('Mute or unmute tab?', true); }
else if (id === 'muteOthers') { setSlimeColor('muted-purple'); showBubble('Mute other tabs?', true); }
else if (id === 'undoClose') { setSlimeColor('thistle-pink'); showBubble('Restore closed tab?', true); }
else if (id === 'openOptions') { setSlimeColor('purple'); showBubble('Open settings?', true); }
};
const handleButtonLeave = () => { scheduleSlimeReset(); hideBubble(); };
const buttonGrid = document.querySelector('.pages-wrapper');
if (buttonGrid) {
buttonGrid.addEventListener('click', handleButtonClick);
buttonGrid.addEventListener('mouseenter', handleButtonHover, true);
buttonGrid.addEventListener('mouseleave', handleButtonLeave, true);
}
})();
