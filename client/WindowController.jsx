// @flow

import * as React from "react"
import {useState, useRef} from "react"
import {css} from "emotion"
import {WindowView} from "./WindowView.jsx"
import {useModel} from "./useModel.js"
import {
  MENU_BAR_HEIGHT_PX,
  BOTTOM_LETTERBOX_HEIGHT_PX,
} from "./global-constants.js"

function newWindow() {
  let x = 60, y = 60
  let screenWidth = 1024, screenHeight = 768
  return {
    nudge,
    getX, getY,
    noticeScreenDimensions,
  }

  function nudge(dx: number, dy: number) {
    x += dx
    y += dy
  }

  function noticeScreenDimensions(width: number, height: number) {
    screenWidth = width; screenHeight = height
  }

  function getX(): number {
    if (x < -1004) return -1004 // FIXME
    if (x > screenWidth - 20) return screenWidth - 20
    return x
  }

  function getY(): number {
    if (y < MENU_BAR_HEIGHT_PX) return MENU_BAR_HEIGHT_PX
    const maxY = screenHeight - BOTTOM_LETTERBOX_HEIGHT_PX - 20
    if (y > maxY) return maxY
    return y
  }
}

export function WindowController(): React.Node {
  const [window, withUpdate] = useModel(newWindow)
  const [urlBar, setUrlBar] = useState("about:blank")
  useCrossFrameMessages(msg => {
    if (msg.data.type === "document-metadata") {
      // FIXME: check re: field to know which window this
      // message is for. As of this writing the window is
      // a singleton.
      setUrlBar(msg.data.url)
    }
  })

  if (document.body)
    window.noticeScreenDimensions(
      document.body.clientWidth,
      document.body.clientHeight,
    )

  return <WindowView
    v={{
      id: "my-awesome-window",
      state: "loaded",
      urlBar: urlBar,
      iframe: {
        src: "https://www.iana.org",
        nonce: 0,
        handleLoaded: establishCommsWithIframe,
        handleMetadata: doc => console.log("got page metadata", doc),
        handleActivateLink: url => console.log("clicked link", url),
        handleHoverLink: url => console.log("hovered link", url),
        handleWillUnload: () => console.log("unloading")
      },
      height: 600,
      width: 1024,
      top: window.getY(),
      left: window.getX(),
    }}
    onMove={withUpdate(window.nudge)}
  />
}

function establishCommsWithIframe({currentTarget: target}) {
  const injectedCode = function(hostFrame, {replyTo}) {
    const {window: hostWindow, origin: hostOrigin} = hostFrame
    postMessageToHost({
      type: "document-metadata",
      re: replyTo,
      title: document.title,
      url: window.location.href,
    })

    function handleHoverLink(href) {
      postMessageToHost({
        type: "hover-link",
        re: replyTo,
        href,
      })
    }

    function handleActivateLink(e) {
      postMessageToHost({
        type: "activate-link",
        re: replyTo,
        href: e.target.href,
      })
    }

    function handleBeforeUnload() {
      postMessageToHost({
        type: "beforeunload",
        re: replyTo,
      })
    }

    function postMessageToHost(msg) {
      hostWindow.postMessage(msg, hostOrigin)
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    if (document.body) {
      document.body.addEventListener("mousemove", (e: any) => {
        let targetEl = e.target
        for (let i = 0; i < 20; i++) {
          if (!targetEl) return;
          if (targetEl.tagName === "A") {
            handleHoverLink(targetEl.href)
            e.preventDefault();
            return;
          } else {
            targetEl = targetEl.parent
          }
        }
      })
    }
  }

  target.contentWindow.postMessage({
    type: "inject",
    extraArgs: [{replyTo: "my-awesome-window"}],
    code: "(" + injectedCode.toString() + ")"
  }, "*")
}

window.addEventListener("message", msg => {
  // console.log("received message", msg)
})

function useCrossFrameMessages(onMessage) {
  const listener = useRef(null)
  window.removeEventListener("message", listener.current)
  window.addEventListener("message", onMessage)
  listener.current = onMessage
  return () => window.removeEventListener("message", listener.current)
}
