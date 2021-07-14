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

function newWindowStack() {
  let windows: Array<Window> = [newWindow("http://example.com", 0)]
  let altitudeOfFocusedWindow = windows[0].getAltitude()
  return {
    addWindow,
    getWindows,
    focus,
  }

  function addWindow(url: string) {
    windows = [...windows, newWindow(url, ++altitudeOfFocusedWindow)]
  }

  function getWindows(): Array<{|window: Window, focused: boolean|}> {
    return windows.map((window, i, all) => {
      return {window, focused: window.getAltitude() === altitudeOfFocusedWindow}
    })
  }

  function focus(windowId: string) {
    for (const w of windows) if (w.getId() === windowId) {
      altitudeOfFocusedWindow++
      w.setAltitude(altitudeOfFocusedWindow)
      break;
    }
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
  setAltitude(number): void,
  noticeScreenDimensions(number, number): void,
  moveLeftEdge(number, number): void,
  getUrlBarText(): string,
  changeUrlBarText(string): void,
  navigate(): void,
  getNavigationViaUrlBar(): NonEmptySignal<string>,
}

function newWindow(initialUrl: string, altitude: number): Window {
  const id = cryptoRandomHex(20)
  let x = 60, y = 60
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
    getAltitude, setAltitude,
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
    return width
  }

  function getHeight(): number {
    return height
  }

  function getAltitude(): number {
    return altitude
  }

  function setAltitude(a: number) {
    altitude = a
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
    console.log("navigating", urlBar)
    navigationViaUrlBar = newSignal(httpify(urlBar))
  }
}

export function WindowStackController(): React.Node {
  const [windowStack, withUpdate] = useModel(newWindowStack)
  useCrossFrameMessages(msg => {
    switch (msg.data.type) {
      case "path-os-open-window": {
        withUpdate(windowStack.addWindow)(msg.data.url)
      }
    }
  })
  return <>
    {windowStack.getWindows().map(({window, focused}) =>
      <WindowController
        key={window.getId()}
        window={window}
        focused={focused}
        withUpdate={withUpdate}
        onFocusRequested={id => withUpdate(windowStack.focus)(id)}
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
    switch (msg.data.type) {
      case "document-metadata": {
        if (msg.data.re === window.getId()) {
          withUpdate(window.changeUrlBarText)(msg.data.url)
        }
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
