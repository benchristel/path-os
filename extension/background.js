function browser() {
  if (typeof chrome !== "undefined")
    return chrome
  if (typeof browser !== "undefined")
    return browser
  throw Error("can't figure out how to talk to the browser")
}

{
  /**
   * Some sites advise the browser not to put them in
   * iframes (e.g. to prevent clickjacking attacks).
   * Override that by removing the relevant headers.
   */

  const blockedHeaders = [
    "content-security-policy",
    "x-frame-options",
  ]

  function isAllowed(header) {
    return !blockedHeaders.includes(header.name.toLowerCase())
  }

  function rewriteRequestHeaders(e) {
    return {requestHeaders: e.requestHeaders}
  }

  function rewriteResponseHeaders(e) {
    return {
      responseHeaders: e.responseHeaders.filter(isAllowed),
    }
  }

  browser().webRequest.onBeforeSendHeaders.addListener(
    rewriteRequestHeaders,
    {urls: ["<all_urls>"]},
    ["blocking", "requestHeaders"]
  )

  browser().webRequest.onHeadersReceived.addListener(
    rewriteResponseHeaders,
    { urls: ["<all_urls>"] },
    ["blocking", "responseHeaders", "extraHeaders"],
  )
}

// TODO: memory leak
// this can probably be replaced with a ring buffer or
// something that will have bounded memory requirements.
const tabIdsMovedToPathOs = {}

{
  /**
   * Listen for new tabs getting opened and move them to
   * the first PathOS tab in the same window, if any. This
   * lets you command-click a link in PathOS (which would
   * normally open a new Chrome tab) to open a new PathOS
   * window.
   */

  const pathOsHosts = [
    "http://localhost:8080",
    "http://localhost:8080/",
    "http://localhost:1234",
    "http://localhost:1234/",
  ]

  function isPathOs(url) {
    return pathOsHosts.includes(url)
  }

  const pathOsTabsByWindowId = {}

  function registerPathOsTab(tabId, _, tab) {
    console.log("registerPathOsTab", tab)
    const url = tab.url || tab.pendingUrl

    if (!isPathOs(url)) {
      unregisterPathOsTab(tab.id)
      return;
    }

    const existingTab = pathOsTabsByWindowId[tab.windowId]
    if (!existingTab) {
      pathOsTabsByWindowId[tab.windowId] = tab
    }
  }

  function moveTabToPathOs(tab) {
    console.log("moveTabToPathOs", tab)
    if (tabIdsMovedToPathOs[tab.id]) return;

    const url = tab.url || tab.pendingUrl
    if (!url || isPathOs(url)) return;

    const pathOsTabInSameWindow = pathOsTabsByWindowId[tab.windowId]
    if (!pathOsTabInSameWindow) return;

    console.log(url, tab.url, tab.pendingUrl)
    browser().tabs.sendMessage(pathOsTabInSameWindow.id, {
      type: "path-os-open-window",
      url,
    })
    browser().tabs.remove(tab.id)
    tabIdsMovedToPathOs[tab.id] = true
  }

  function unregisterPathOsTab(tabId) {
    for (const t of Object.values(pathOsTabsByWindowId)) {
      if (t.id === tabId) {
        console.log("Path OS tab closed", {tabId})
        delete pathOsTabsByWindowId[t.windowId]
      }
    }
  }

  browser().tabs.onUpdated.addListener(registerPathOsTab)
  browser().tabs.onUpdated.addListener((_1, _2, tab) => moveTabToPathOs(tab))
  browser().tabs.onCreated.addListener(moveTabToPathOs)
  browser().tabs.onRemoved.addListener(unregisterPathOsTab)
}
