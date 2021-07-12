// @flow

import * as React from "react"
import {useState, useRef} from "react"
import {css} from "emotion"
import {WindowView} from "./WindowView.jsx"
import {useModel} from "./useModel.js"
import {httpify} from "./httpify.js"
import {useCrossFrameMessages} from "./useCrossFrameMessages.js"
import {newSignal} from "./signal.js"
import type {Signal} from "./signal.js"
import {
  MENU_BAR_HEIGHT_PX,
  BOTTOM_LETTERBOX_HEIGHT_PX,
} from "./global-constants.js"

function newWindow() {
  let x = 60, y = 60
  let width = 1024, height = 600
  let screenWidth = 1024, screenHeight = 768
  let urlBar = ""
  // a signal that updates whenever the user jumps to a new
  // page by typing in the URL bar and hitting "Return"
  let navigationViaUrlBar = newSignal("http://example.com")
  return {
    nudge,
    getX, getY,
    getWidth, getHeight,
    noticeScreenDimensions,
    moveLeftEdge,
    getUrlBarText,
    changeUrlBarText,
    navigate,
    getNavigationViaUrlBar,
  }

  function nudge(dx: number, dy: number) {
    x += dx
    y += dy
  }

  function getX(): number {
    if (x < -1004) return -1004 // FIXME
    if (x > screenWidth - 20) return screenWidth - 20
    return x
  }

  function getY(): number {
    if (y <= MENU_BAR_HEIGHT_PX) return MENU_BAR_HEIGHT_PX
    const maxY = screenHeight - BOTTOM_LETTERBOX_HEIGHT_PX - 20
    if (y > maxY) return maxY
    return y
  }

  function getWidth(): number {
    return width;
  }

  function getHeight(): number {
    return height;
  }

  function noticeScreenDimensions(width: number, height: number) {
    screenWidth = width; screenHeight = height
  }

  function moveLeftEdge(dx: number, dy: number) {
    x += dx
    width -= dx
  }

  function getUrlBarText(): string {
    return urlBar
  }

  function changeUrlBarText(text: string) {
    urlBar = text
  }

  function getNavigationViaUrlBar(): Signal<string> {
    return navigationViaUrlBar
  }

  function navigate() {
    console.log("navigating", urlBar)
    navigationViaUrlBar = newSignal(httpify(urlBar))
  }
}

export function WindowController(): React.Node {
  const [window, withUpdate] = useModel(newWindow)
  useCrossFrameMessages(msg => {
    switch (msg.data.type) {
      case "document-metadata": {
        // FIXME: check re: field to know which window this
        // message is for. As of this writing the window is
        // a singleton.
        withUpdate(window.changeUrlBarText)(msg.data.url)
        break;
      }
      case "hover-link": {
        break;
      }
      default: {
        console.log("received cross-window message", msg)
      }
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
      urlBar: window.getUrlBarText(),
      height: window.getHeight(),
      width: window.getWidth(),
      top: window.getY(),
      left: window.getX(),
      iframe: {
        src: window.getNavigationViaUrlBar(),
        handleLoaded: establishCommsWithIframe,
        handleWillUnload: () => console.log("unloading")
      },
    }}
    onUrlEdited={withUpdate(window.changeUrlBarText)}
    onNavigationRequested={withUpdate(window.navigate)}
    onMove={withUpdate(window.nudge)}
    onMoveLeftEdge={withUpdate(window.moveLeftEdge)}
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
