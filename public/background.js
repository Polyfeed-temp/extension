// background.js（service-worker）

// Handle browser action (extension icon) clicks to toggle sidebar
chrome.action.onClicked.addListener((tab) => {
  // Send message to content script to toggle sidebar
  chrome.tabs.sendMessage(tab.id, { action: 'toggleSidebar' });
});