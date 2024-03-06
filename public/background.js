try {
  chrome.action.onClicked.addListener(async (tab) => {
    const enabled = !(await chrome.storage.local.get("enabled")).enabled;
    console.log(enabled);
    chrome.action.setIcon({
      path: enabled ? "Polyfeed_Social_On.png" : "Polyfeed_Social_Off.png",
    });
    if (enabled) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "contentScriptOn" },
          function (response) {
            console.log(response);
          }
        );
      });
    } else {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: "contentScriptOff" },
          function (response) {
            console.log(response.farewell);
          }
        );
      });
    }

    chrome.action.setBadgeText({ text: enabled ? "Active" : "" });
    await chrome.storage.local.set({ enabled });
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "contentScriptActive") {
      chrome.identity.getAuthToken({ interactive: true }, function (token) {
        chrome.tabs.sendMessage(sender.tab.id, {
          action: "login",
          token: token,
        });
      });

      console.log("contentScriptActive");
      chrome.action.setIcon({ path: "Polyfeed_Social_On.png" });
      chrome.action.setBadgeText({ text: "Active" });
    }
    if (request.action === "contentScriptInactive") {
      console.log("contentScriptInactive");
      chrome.action.setIcon({ path: "Polyfeed_Social_Off.png" });
      chrome.action.setBadgeText({ text: "" });
    }
  });
} catch (e) {
  console.error(e);
}
