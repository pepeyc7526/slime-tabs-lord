'use strict';

(async () => {
  const state = { cachedData: null, cacheTimestamp: 0, closePopupAfterAction: false };

  const getTabsData = async () => {
    try {
      const now = Date.now();
      if (state.cachedData && (now - state.cacheTimestamp) < window.SlimeConfig.CACHE_DURATION) {
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
    const countEl = window.getEl('tabCount');
    if (countEl) countEl.textContent = tabs.length;
    createTabCubes(tabs.length);
    return tabs;
  };

  const createTabCubes = (count) => {
    const container = window.getEl('tabCubes');
    if (!container) return;
    container.innerHTML = '';
    const regularCubes = Math.min(count, window.SlimeConfig.MAX_TAB_CUBES);
    for (let i = 0; i < regularCubes; i++) {
      const cube = document.createElement('div');
      cube.className = 'tab-cube';
      container.appendChild(cube);
    }
    if (count > window.SlimeConfig.MAX_TAB_CUBES) {
      const plusCube = document.createElement('div');
      plusCube.className = 'tab-cube plus';
      plusCube.title = `${count - window.SlimeConfig.MAX_TAB_CUBES} more tabs`;
      container.appendChild(plusCube);
    }
  };

  const setSlimeColor = (color) => {
    const slime = window.getEl('slime');
    if (slime) color ? slime.setAttribute('data-color', color) : slime.removeAttribute('data-color');
  };

  const animateSlime = async (color) => {
    const slime = window.getEl('slime');
    const outline = window.getEl('slimeOutline');
    if (!slime) return;
    setSlimeColor(color);
    await window.sleep(window.SlimeConfig.ANIMATION_DELAY);
    outline?.classList.add('hidden');
    slime.classList.add('eating');
    const tabCubes = document.querySelectorAll('.tab-cube');
    for (const cube of tabCubes) {
      cube.classList.add('flying');
      await window.sleep(window.SlimeConfig.CUBE_FLY_DELAY);
      cube.remove();
      await window.sleep(window.SlimeConfig.CUBE_REMOVE_DELAY);
    }
    slime.classList.remove('eating');
    slime.classList.add('happy');
    await window.sleep(window.SlimeConfig.HAPPY_DURATION);
    slime.classList.remove('happy');
    outline?.classList.remove('hidden');
  };

  const applyPopupStyle = async () => {
    const settings = await browser.storage.local.get(window.SlimeDefaults);
    const root = document.documentElement.style;
    root.setProperty('--popup-bg', settings.popupBg);
    root.setProperty('--popup-text', settings.popupText);
    root.setProperty('--btn-close-others', settings.btnCloseOthers);
    root.setProperty('--btn-close-right', settings.btnCloseRight);
    root.setProperty('--btn-settings', settings.btnSettings);
    document.querySelectorAll('.btn').forEach(btn => {
      btn.classList.toggle('btn-transparent', settings.btnTransparent);
    });
    const outlineEl = window.getEl('slimeOutline');
    if (outlineEl) {
      outlineEl.style.display = settings.slimeOutlineEnabled ? 'block' : 'none';
      outlineEl.style.border = settings.slimeOutlineEnabled ? `3px solid ${settings.slimeOutline}` : 'none';
    }
    state.closePopupAfterAction = settings.closePopup;
  };

  const handleCloseAction = async (filterFn, color) => {
    try {
      const tabs = await getTabsData();
      const currentTab = tabs.find(t => t.active);
      const tabsToClose = tabs.filter(tab => filterFn(currentTab, tab)).map(tab => tab.id);
      if (tabsToClose.length > 0) {
        await animateSlime(color);
        await browser.tabs.remove(tabsToClose);
        state.cachedData = null;
        await updateCount();
        if (state.closePopupAfterAction) {
          await window.sleep(window.SlimeConfig.CLOSE_POPUP_DELAY);
          window.close();
        }
      }
    } catch (error) {
      console.error('Slime Tabs Lord: Failed to close tabs', error);
    }
  };

  // Init
  await applyPopupStyle();
  await updateCount();

  // Buttons
  window.getEl('closeOthers')?.addEventListener('click', () => 
    handleCloseAction((curr, tab) => tab.id !== curr?.id, 'red'));
  window.getEl('closeRight')?.addEventListener('click', () => 
    handleCloseAction((curr, tab) => tab.index > curr?.index, 'pink'));
  window.getEl('openOptions')?.addEventListener('click', (e) => {
    e.preventDefault();
    browser.runtime.openOptionsPage();
  });

  // Hover effects
  window.getEl('closeOthers')?.addEventListener('mouseenter', () => setSlimeColor('red'));
  window.getEl('closeOthers')?.addEventListener('mouseleave', () => setSlimeColor(null));
  window.getEl('closeRight')?.addEventListener('mouseenter', () => setSlimeColor('pink'));
  window.getEl('closeRight')?.addEventListener('mouseleave', () => setSlimeColor(null));
  window.getEl('openOptions')?.addEventListener('mouseenter', () => setSlimeColor('cyan'));
  window.getEl('openOptions')?.addEventListener('mouseleave', () => setSlimeColor(null));
})();
