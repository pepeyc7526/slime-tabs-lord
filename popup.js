'use strict';
import { SlimeConfig, SlimeDefaults, SlimeThemes, getSystemTheme, applyThemeToSettings, getEl, sleep, isAndroid } from './utils.js';
import { SlimeFacts, getContextualFact, checkTripleTap } from './slime-facts.js';
(async () => {
const state = {
cachedData: null,
cacheTimestamp: 0,
closePopupAfterAction: false,
factTimeout: null,
slimeResetTimeout: null
};
const isMobile = isAndroid();
const ensureThemeInitialized = async () => {
const settings = await browser.storage.local.get('theme');
if (!settings.theme) {
const systemTheme = await getSystemTheme();
const themeData = SlimeThemes[systemTheme];
await browser.storage.local.set({
theme: systemTheme,
popupBg: themeData.popupBg,
popupText: themeData.popupText,
slimeOutline: themeData.slimeOutline,
tabCubeColor: themeData.tabCubeColor,
tabCubePlusColor: themeData.tabCubePlusColor,
badgeColor: themeData.badgeColor,
bgColor: themeData.bgColor
});
}
};
await ensureThemeInitialized();
const getTabsData = async () => {
try {
const now = Date.now();
if (state.cachedData && (now - state.cacheTimestamp) < SlimeConfig.CACHE_DURATION) {
return state.cachedData;
}
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
if (state.factTimeout) {
clearTimeout(state.factTimeout);
state.factTimeout = null;
}
bubble.textContent = text;
bubble.classList.toggle('is-button', isButton);
bubble.classList.add('visible');
};
const hideBubble = () => {
const bubble = getEl('speechBubble');
if (!bubble) return;
if (state.factTimeout) {
clearTimeout(state.factTimeout);
state.factTimeout = null;
}
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
if (!slime || slime.classList.contains('eating') || slime.classList.contains('happy')) {
setTimeout(blinkSlime, SlimeConfig.BLINK_MIN_DELAY);
return;
}
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
state.factTimeout = setTimeout(() => {
hideBubble();
}, 5000);
};
const applyPopupStyle = async () => {
let settings = await browser.storage.local.get(SlimeDefaults);
settings = await applyThemeToSettings(settings);
document.body.style.background = settings.popupBg;
document.body.style.color = settings.popupText;
document.documentElement.style.setProperty('--icon-size', `${settings.iconSize}%`);
document.documentElement.style.setProperty('--tab-cube-color', settings.tabCubeColor);
document.documentElement.style.setProperty('--tab-cube-plus-color', settings.tabCubePlusColor);
const tabsInfo = getEl('tabsInfo');
if (tabsInfo) {
tabsInfo.style.color = settings.popupText;
}
const outlineEl = getEl('slimeOutline');
if (outlineEl) {
if (settings.slimeOutlineEnabled) {
outlineEl.style.display = 'block';
outlineEl.style.border = `3px solid ${settings.slimeOutline}`;
} else {
outlineEl.style.display = 'none';
}
}
document.querySelectorAll('.btn').forEach(btn => {
if (!settings.btnTransparent) {
btn.classList.add('btn-transparent');
} else {
btn.classList.remove('btn-transparent');
}
});
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
if (state.closePopupAfterAction) {
await sleep(SlimeConfig.CLOSE_POPUP_DELAY);
window.close();
}
}
} catch (error) {
console.error('Slime Tabs Lord: Failed to close tabs', error);
}
};
const handleUndoClose = async () => {
try {
const recentlyClosed = await browser.sessions.getRecentlyClosed({ maxResults: 1 });
if (recentlyClosed && recentlyClosed.length > 0) {
await browser.sessions.restore(recentlyClosed[0].sessionId);
showBubble('Tab restored', true);
await sleep(1500);
hideBubble();
await updateCount();
} else {
showBubble('No tabs to restore', true);
await sleep(1500);
hideBubble();
}
} catch (error) {
console.error('Slime Tabs Lord: Failed to undo close', error);
showBubble('Something went wrong', true);
await sleep(1500);
hideBubble();
}
};
const handleDuplicate = async () => {
try {
const tabs = await getTabsData();
const currentTab = tabs.find(t => t.active);
if (currentTab) {
await browser.tabs.duplicate(currentTab.id);
showBubble('Tab duplicated', true);
await sleep(1500);
hideBubble();
await updateCount();
}
} catch (error) {
console.error('Slime Tabs Lord: Failed to duplicate', error);
showBubble('Something went wrong', true);
await sleep(1500);
hideBubble();
}
};
const handleMute = async () => {
try {
const tabs = await getTabsData();
const currentTab = tabs.find(t => t.active);
if (currentTab) {
await browser.tabs.update(currentTab.id, { muted: !currentTab.mutedInfo.muted });
const action = currentTab.mutedInfo.muted ? 'Unmuted' : 'Muted';
showBubble(action, true);
await sleep(1500);
hideBubble();
}
} catch (error) {
console.error('Slime Tabs Lord: Failed to mute', error);
showBubble('Something went wrong', true);
await sleep(1500);
hideBubble();
}
};
const handleRemoveDuplicates = async () => {
try {
const tabs = await getTabsData();
const urlMap = new Map();
const duplicates = [];
tabs.forEach(tab => {
if (urlMap.has(tab.url)) {
duplicates.push(tab.id);
} else {
urlMap.set(tab.url, tab.id);
}
});
if (duplicates.length > 0) {
await animateSlime('blue');
await browser.tabs.remove(duplicates);
showBubble(`Removed ${duplicates.length} duplicates`, true);
await sleep(1500);
hideBubble();
await updateCount();
} else {
showBubble('No duplicates found', true);
await sleep(1500);
hideBubble();
}
} catch (error) {
console.error('Slime Tabs Lord: Failed to remove duplicates', error);
showBubble('Something went wrong', true);
await sleep(1500);
hideBubble();
}
};
const scheduleSlimeReset = () => {
if (state.slimeResetTimeout) clearTimeout(state.slimeResetTimeout);
state.slimeResetTimeout = setTimeout(() => {
setSlimeColor(null);
hideBubble();
state.slimeResetTimeout = null;
}, 2000);
};
const cancelSlimeReset = () => {
if (state.slimeResetTimeout) {
clearTimeout(state.slimeResetTimeout);
state.slimeResetTimeout = null;
}
};
await applyPopupStyle();
await updateCount();
blinkSlime();
getEl('slime')?.addEventListener('click', showSlimeFact);
getEl('slime')?.addEventListener('keypress', (e) => {
if (e.key === 'Enter' || e.key === ' ') {
e.preventDefault();
showSlimeFact(e);
}
});
getEl('openOptions')?.addEventListener('click', (e) => {
e.preventDefault();
browser.runtime.openOptionsPage();
});
if (!isMobile) {
getEl('undoClose')?.addEventListener('mouseenter', () => {
cancelSlimeReset();
setSlimeColor('orange');
showBubble('Restore closed tab?', true);
});
getEl('undoClose')?.addEventListener('mouseleave', () => {
scheduleSlimeReset();
});
getEl('undoClose')?.addEventListener('click', handleUndoClose);
getEl('duplicateTab')?.addEventListener('mouseenter', () => {
cancelSlimeReset();
setSlimeColor('gray');
showBubble('Duplicate tab?', true);
});
getEl('duplicateTab')?.addEventListener('mouseleave', () => {
scheduleSlimeReset();
});
getEl('duplicateTab')?.addEventListener('click', handleDuplicate);
getEl('muteTab')?.addEventListener('mouseenter', () => {
cancelSlimeReset();
setSlimeColor('light-gray');
showBubble('Mute or unmute tab?', true);
});
getEl('muteTab')?.addEventListener('mouseleave', () => {
scheduleSlimeReset();
});
getEl('muteTab')?.addEventListener('click', handleMute);
getEl('closeOthers')?.addEventListener('mouseenter', () => {
cancelSlimeReset();
setSlimeColor('red');
showBubble('Close all other tabs?', true);
});
getEl('closeOthers')?.addEventListener('mouseleave', () => {
scheduleSlimeReset();
});
getEl('closeOthers')?.addEventListener('click', () =>
handleCloseAction((curr, tab) => tab.id !== curr?.id, 'red', 'Nom nom! Delicious!'));
getEl('closeRight')?.addEventListener('mouseenter', () => {
cancelSlimeReset();
setSlimeColor('pink');
showBubble('Close tabs to the right?', true);
});
getEl('closeRight')?.addEventListener('mouseleave', () => {
scheduleSlimeReset();
});
getEl('closeRight')?.addEventListener('click', () =>
handleCloseAction((curr, tab) => tab.index > curr?.index, 'pink', 'Burp! So good!'));
getEl('removeDuplicates')?.addEventListener('mouseenter', () => {
cancelSlimeReset();
setSlimeColor('blue');
showBubble('Remove duplicates?', true);
});
getEl('removeDuplicates')?.addEventListener('mouseleave', () => {
scheduleSlimeReset();
});
getEl('removeDuplicates')?.addEventListener('click', handleRemoveDuplicates);
getEl('openOptions')?.addEventListener('mouseenter', () => {
cancelSlimeReset();
setSlimeColor('purple');
showBubble('Open settings?', true);
});
getEl('openOptions')?.addEventListener('mouseleave', () => {
scheduleSlimeReset();
});
}
})();
