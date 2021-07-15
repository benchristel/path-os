// @flow

import * as React from "react"
import {useState, useRef} from "react"
import {css} from "emotion"
import {WindowView} from "./WindowView.jsx"
import {useModel} from "./useModel.js"
import {httpify} from "./httpify.js"
import {useCrossFrameMessages} from "./useCrossFrameMessages.js"
import {newSignal} from "./signal.js"
import type {NonEmptySignal} from "./signal.js"
import type {Wrapper} from "./useModel.js"
import {
  MENU_BAR_HEIGHT_PX,
  BOTTOM_LETTERBOX_HEIGHT_PX,
} from "./global-constants.js"
import {cryptoRandomHex} from "./cryptoRandomHex.js"
import {sequence} from "./sequence.js"

const increment: number => number = a => a + 1

function newDesktop() {
  const altitudeSequence = sequence(0, increment)
  let windows: Array<Window> = [newWindow("http://example.com", altitudeSequence)]
  return {
    addWindow,
    getWindows,
  }

  function addWindow(url: string) {
    windows = [...windows, newWindow(url, altitudeSequence)]
  }

  function getWindows(): Array<Window> {
    return windows
  }
}

type Window = {
  getId(): string,
  nudge(dx: number, dy: number): void,
  getX(): number,
  getY(): number,
  getWidth(): number,
  getHeight(): number,
  getAltitude(): number,
  focus(): void,
  noticeScreenDimensions(number, number): void,
  moveLeftEdge(number, number): void,
  getUrlBarText(): string,
  changeUrlBarText(string): void,
  navigate(): void,
  getNavigationViaUrlBar(): NonEmptySignal<string>,
}

function newWindow(initialUrl: string, nextAltitude: () => number): Window {
  const id = cryptoRandomHex(20)
  let altitude = 0
  focus()
  let x = 60, y = 60 // position of the top left corner
  let width = 1024, height = 600
  let screenWidth = 1024, screenHeight = 768
  let urlBar = ""
  // a signal that updates whenever the user jumps to a new
  // page by typing in the URL bar and hitting "Return"
  let navigationViaUrlBar = newSignal(initialUrl)
  return {
    getId,
    nudge,
    getX, getY,
    getWidth, getHeight,
    getAltitude,
    focus,
    noticeScreenDimensions,
    moveLeftEdge,
    getUrlBarText,
    changeUrlBarText,
    navigate,
    getNavigationViaUrlBar,
  }

  function getId(): string {
    return id
  }

  function nudge(dx: number, dy: number) {
    x += dx
    y += dy
  }

  function getX(): number {
    if (x < -width + 20) return -width + 20
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
    return width
  }

  function getHeight(): number {
    return height
  }

  function getAltitude(): number {
    return altitude
  }

  function focus() {
    altitude = nextAltitude()
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

  function getNavigationViaUrlBar(): NonEmptySignal<string> {
    return navigationViaUrlBar
  }

  function navigate() {
    navigationViaUrlBar = newSignal(httpify(urlBar))
  }
}

function max(xs: Array<number>): number {
  return xs.reduce((top, x) => Math.max(top, x), -Infinity)
}

export function DesktopController(): React.Node {
  const [windowStack, withUpdate] = useModel(newDesktop)
  useCrossFrameMessages(msg => {
    switch (msg.data.type) {
      case "path-os-open-window": {
        withUpdate(windowStack.addWindow)(msg.data.url)
      }
    }
  })
  const windows = windowStack.getWindows()
  const maxAltitude = max(windows.map(w => w.getAltitude()))
  return <>
    {windows.map(window =>
      <WindowController
        window={window}
        focused={window.getAltitude() === maxAltitude}
        withUpdate={withUpdate}
        onFocusRequested={withUpdate(window.focus)}
      />
    )}
  </>
}

export function WindowController(props: {|
  window: Window,
  withUpdate: Wrapper,
  focused: boolean,
  onFocusRequested: (id: string) => mixed,
|}): React.Node {
  const {window, withUpdate, focused, onFocusRequested} = props
  useCrossFrameMessages(msg => {
    const windowId = window.getId()
    switch (msg.data.type) {
      case "document-metadata": {
        if (msg.data.re === windowId) {
          withUpdate(window.changeUrlBarText)(msg.data.url)
        }
        break;
      }
      case "hover-link": {
        break;
      }
      default: {
        console.debug("received cross-window message", msg)
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
      state: "loaded",
      id: window.getId(),
      urlBar: window.getUrlBarText(),
      height: window.getHeight(),
      width: window.getWidth(),
      top: window.getY(),
      left: window.getX(),
      focused: focused,
      zIndex: window.getAltitude(),
      iframe: {
        src: window.getNavigationViaUrlBar(),
        handleLoaded: establishCommsWithIframe(window.getId()),
        handleWillUnload: () => console.log("unloading")
      },
    }}
    onFocusRequested={onFocusRequested}
    onUrlEdited={withUpdate(window.changeUrlBarText)}
    onNavigationRequested={withUpdate(window.navigate)}
    onMove={withUpdate(window.nudge)}
    onMoveLeftEdge={withUpdate(window.moveLeftEdge)}
    key={window.getId()}
  />
}

const establishCommsWithIframe = (windowId) => ({currentTarget: target}) => {
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
    extraArgs: [{replyTo: windowId}],
    code: "(" + injectedCode.toString() + ")"
  }, "*")
}
