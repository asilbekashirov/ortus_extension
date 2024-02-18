export async function getActiveTabURL() {
    const tabs = await chrome.tabs.query({
        currentWindow: true,
        active: true
    });
  
    return tabs[0];
}

export function setAttributes(target, attributes) {
    for (const key in attributes) {
        target.setAttribute(key, attributes[key]);
    }
}