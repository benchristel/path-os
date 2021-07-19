// @flow

import * as React from "react"
import type {Window} from "./Window.js"
import {WindowView} from "./WindowView.jsx"
import {useCrossFrameMessages} from "./useCrossFrameMessages.js"
import type {Wrapper} from "./useModel.js"

export function WindowController(props: {|
  window: Window,
  withUpdate: Wrapper,
  focused: boolean,
|}): React.Node {
  const {window, withUpdate, focused} = props
  useCrossFrameMessages(msg => {
    const windowId = window.getId()
    switch (msg.data.type) {
      case "document-metadata": {
        if (msg.data.re === windowId) {
          withUpdate(window.noticeNewUrl)(msg.data.url)
        }
        break;
      }
      case "hover-link": {
        break;
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
      position: window.getPosition(),
      zIndex: window.getAltitude(),
      focused,
      iframe: {
        src: window.getImposedNavigation(),
        handleLoaded: establishCommsWithIframe(window.getId()),
        handleWillUnload: () => console.log("unloading")
      },
    }}
    onFocusRequested={withUpdate(window.focus)}
    onUrlEdited={withUpdate(window.changeUrlBarText)}
    onNavigationRequested={withUpdate(window.navigate)}
    onBackButtonClicked={withUpdate(window.goBack)}
    onMove={withUpdate(window.nudge)}
    onMoveLeftEdge={withUpdate(window.moveLeftEdge)}
    onMoveRightEdge={withUpdate(window.moveRightEdge)}
    onMoveBottomEdge={withUpdate(window.moveBottomEdge)}
    onCloseRequested={withUpdate(window.close)}
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
