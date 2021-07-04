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
    const result = !blockedHeaders.includes(header.name)
    console.log("isAllowed", header.name, result)
    return result
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
