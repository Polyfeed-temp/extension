// background.js（service-worker）

const ICON_ON = 'Polyfeed_Social_On.png';
const ICON_OFF = 'Polyfeed_Social_Off.png';
const BADGE_ON = { text: 'On' };
const BADGE_OFF = { text: '' };

async function getEnabled() {
  const { enabled = false } = await chrome.storage.local.get('enabled'); // 預設 false
  return enabled;
}

async function setEnabled(enabled) {
  await chrome.storage.local.set({ enabled });
  await chrome.action.setIcon({ path: enabled ? ICON_ON : ICON_OFF });
  await chrome.action.setBadgeText(enabled ? BADGE_ON : BADGE_OFF);
}

function tellTab(tabId, action, extra = {}) {
  chrome.tabs.sendMessage(tabId, { action, ...extra });
}

// Auto-inject on all new tabs
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (
    changeInfo.status === 'complete' &&
    tab.url &&
    !tab.url.startsWith('chrome://')
  ) {
    const enabled = await getEnabled();
    if (enabled) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tabId, allFrames: true },
          files: ['js/index.js'],
          world: 'ISOLATED',
        });
        tellTab(tabId, 'contentScriptOn');
      } catch (error) {
      }
    }
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  const next = !(await getEnabled());
  await setEnabled(next);

  if (next) {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: true },
      files: ['build/js/index.js'],
      world: 'ISOLATED',
    });
    tellTab(tab.id, 'contentScriptOn');
  } else {
    tellTab(tab.id, 'contentScriptOff');
  }
});

chrome.runtime.onMessage.addListener((req, sender) => {
  if (!sender.tab) return; // 只理會 tab 來的訊息

  switch (req.action) {
    case 'contentScriptActive':
      setEnabled(true); // 順便更新 icon/badge
      break;

    case 'contentScriptInactive':
      setEnabled(false);
      break;
  }
});
