// background.js（service-worker）

const ICON_ON = chrome.runtime.getURL('public/Polyfeed_Social_On.png');
const ICON_OFF = chrome.runtime.getURL('public/Polyfeed_Social_Off.png');
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
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError) {
          console.error('Auth token error:', chrome.runtime.lastError);
          tellTab(sender.tab.id, 'loginError', {
            error: chrome.runtime.lastError.message,
          });
          return;
        }
        if (token) {
          tellTab(sender.tab.id, 'login', { token });
        } else {
          console.error('No token received');
          tellTab(sender.tab.id, 'loginError', { error: 'No token received' });
        }
      });
      setEnabled(true); // 順便更新 icon/badge
      break;

    case 'contentScriptInactive':
      setEnabled(false);
      break;
  }
});
