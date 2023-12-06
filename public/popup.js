document.addEventListener(
  "DOMContentLoaded",
  function () {
    var triggerButton = document.getElementById("trigger");
    triggerButton.addEventListener(
      "click",
      function () {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {action: "triggerContentScript"});
        });
      },
      false
    );
  },
  false
);
