chrome.runtime.onMessage.addListener((message, sender) => {
  pathOsHosts = [
    "http://localhost:8080/",
    "http://localhost:1221/",
  ]

  if (pathOsHosts.includes(window.location.href)) {
    window.postMessage(message, "*")
  }
})
