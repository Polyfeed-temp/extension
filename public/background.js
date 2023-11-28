function saveToChromeStorageLocal(key, value) {
  chrome.storage.local.set({[key]: value}, function () {
    console.log(`Value ${value} saved to Chrome storage local with key ${key}`);
  });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "getValue") {
    chrome.storage.local.get(request.key, function (result) {
      sendResponse(result[request.key]);
    });
  }
});
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "setValue") {
    saveToChromeStorageLocal(request.key, request.value);
  }
});

chrome.storage.local.get(null, function () {
  chrome.storage.local.set({[key]: value}, function () {
    console.log(`Value ${value} saved to Chrome storage local with key ${key}`);
  });
});
