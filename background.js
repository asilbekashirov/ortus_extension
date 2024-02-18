chrome.webRequest.onCompleted.addListener(handleCalendarRequestCheck, {
  urls: ["https://ortus.rtu.lv/*"],
});

async function handleCalendarRequestCheck(url) {
  try {
    const isFetchingSchedule =
      url.url.split(/getCalendarEventDataUrl/).length > 1;
    console.log(isFetchingSchedule);

    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [activeTab] = await chrome.tabs.query(queryOptions);

    if (isFetchingSchedule && activeTab) {
      chrome.tabs.sendMessage(activeTab.id, {
        type: "FETCHING_SCHEDULE",
        value: null,
      });
    }
  } catch (error) {
    console.log("error");
  } finally {
    return url
  }
}

chrome.tabs.onUpdated.addListener((tabId, tab) => {
  // const isRtuDomain = tab?.url.match('https:\/\/.*.rtu.lv\/.*')
  if (tab.url && tab.url.match("https://id2.rtu.lv/*")) {
    chrome.tabs.sendMessage(tabId, {
      type: "LOGIN_PAGE",
      value: null,
    });
  } else if (tab.url && tab.url.match("https://ortus.rtu.lv/*")) {
    chrome.tabs.sendMessage(tabId, {
      type: "MAIN_PAGE",
      value: null,
    });
  }
});
