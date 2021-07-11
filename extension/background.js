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

  const pathOsTabsByWindowId = {}

  function registerPathOsTab(tabId, _, tab) {
    console.log("tab updated", tab)
    const url = tab.url || tab.pendingUrl

    if (!pathOsHosts.includes(url)) {
      unregisterPathOsTab(tab.id)
      return;
    }

    const existingTab = pathOsTabsByWindowId[tab.windowId]
    if (!existingTab) {
      pathOsTabsByWindowId[tab.windowId] = tab
    }
  }

  function moveTabToPathOs(tab) {
    console.log("tab created", tab, pathOsTabsByWindowId)
    const url = tab.url || tab.pendingUrl
    const pathOsTabInSameWindow = pathOsTabsByWindowId[tab.windowId]
    if (pathOsTabInSameWindow) {
      browser().tabs.sendMessage(pathOsTabInSameWindow.id, {
        type: "path-os-open-window",
        url,
      })
      browser().tabs.remove(tab.id)
    }
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
  browser().tabs.onCreated.addListener(moveTabToPathOs)
  browser().tabs.onRemoved.addListener(unregisterPathOsTab)
}
