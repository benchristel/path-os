// This content script provides a way for PathOS to execute
// arbitrary code in the context of the window in which
// the content script runs (e.g. an iframe).
//
// The purpose of this is to allow the injected code to be
// part of the PathOS client codebase and thus be
// typechecked by Flow. If all the code we wanted to run
// in iframes were part of the extension, we wouldn't be
// able to typecheck it as easily. Also, updating extensions
// is annoying, so development is easier if the extension
// rarely changes.

;(() => {
  if (!isIframe(window)) return;

  let pathOsHost = null
  const allowedMessageOrigins = [
    "http://localhost:1234",
    "http://localhost:8080"
  ]

  window.addEventListener("message", e => {
    if (!allowedMessageOrigins.includes(e.origin)) {
      console.error(`window at ${window.location.href} received message from unrecognized domain`, e.origin, e.data)
      return;
    }

    if (!pathOsHost) {
      pathOsHost = {
        window: e.source,
        origin: e.origin,
      }
      window.addEventListener("beforeunload", () => {
        e.source.postMessage({type: "beforeunload"}, e.origin)
      })
    }

    if (e.data.type === "inject") {
      const func = __pathOsEvaluate__(e.data.code)
      if (typeof func === "function") {
        func(pathOsHost, ...e.data.extraArgs)
      } else {
        console.error("injected code did not evaluate to a function", e.data.code)
      }
    }
  })
})();

function __pathOsEvaluate__(code) {
  // Wrap eval in a function to limit the variables that
  // are visible to the eval'd code. This is to reduce the
  // probability of wacky bugs due to eval'ing code that
  // accidentally accesses variables that just happen to
  // be defined in the enclosing scope. It is *not* an
  // effective security precaution.
  return eval(code)
}

function isIframe(win) {
  return win.parent !== win
}
