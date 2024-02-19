const handleExtensionState = (newState) => {
  chrome.action.setBadgeText({ text: newState });
  chrome.storage.sync.set({
    extension_state: JSON.stringify(newState),
  });
};

function handleCalendarRequestCheck(url) {
  try {
    const isFetchingSchedule =
      url.url.split(/getCalendarEventDataUrl/).length > 1;

    if (isFetchingSchedule) {
      sendMessage({
        type: "FETCHING_SCHEDULE",
        value: null,
      })
    }
  } catch (error) {
    console.log("error");
  } finally {
    return url;
  }
}

const returnExtensionStatus = () => {
  return new Promise(function (resolve, reject) {
    chrome.storage.sync.get(["extension_state"], (data) => {
      if (data["extension_state"]) {
        resolve(data["extension_state"] ? JSON.parse(data["extension_state"]) : "on")
      }
    })
  })
}

async function sendMessage(message) {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [activeTab] = await chrome.tabs.query(queryOptions);
  const isActive = await returnExtensionStatus()

  if (activeTab) {
    chrome.tabs.sendMessage(activeTab.id, {...message, isActive });
  }
}

chrome.webRequest.onCompleted.addListener(handleCalendarRequestCheck, {
  urls: ["https://ortus.rtu.lv/*"],
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  const state = changes["extension_state"]
  if (state && state.newValue !== state.oldValue) {
    sendMessage({
      type: "REFRESH_PAGE",
      value: null
    })
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // const isRtuDomain = tab?.url.match('https:\/\/.*.rtu.lv\/.*')
  returnExtensionStatus().then(isActive => {
    if (tab.url && tab.url.match("https://id2.rtu.lv/*")) {
      chrome.tabs.sendMessage(tabId, {
        type: "LOGIN_PAGE",
        value: null,
        isActive
      });
    } else if (tab.url && tab.url.match("https://ortus.rtu.lv/*")) {
      chrome.tabs.sendMessage(tabId, {
        type: "MAIN_PAGE",
        value: null,
        isActive
      });
    }
  })

});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  const { type, value } = request;

  if (type === "EXTENSION_STATE") {
    handleExtensionState(value);
  }

  sendResponse();
});

chrome.runtime.onInstalled.addListener(() => {
  handleExtensionState("on");
})