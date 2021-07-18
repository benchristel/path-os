// @flow

import * as React from "react"
import {sequence} from "./sequence.js"
import {useCrossFrameMessages} from "./useCrossFrameMessages.js"
import {useModel} from "./useModel.js"
import {WindowController} from "./WindowController.jsx"
import {newWindow} from "./Window.js"
import type {Window} from "./Window.js"
import {DesktopView} from "./DesktopView.jsx"
import {unreachable} from "./unreachable.js"
import type {Point} from "./Point.js"

const increment: number => number = a => a + 1

export type Desktop = {|
  addWindow(url: string, WindowStartingPosition): void,
  getWindows(): Array<Window>,
  getFocusedWindow(): ?Window,
|}

type WindowStartingPosition =
  | {|type: "default"|}
  | {|type: "offset-from", origin: Point|}

function downAndToTheRight(p: Point): Point {
  const [x, y] = p
  if (x < 300 && y < 300)
    return [x + 21, y + 21]
  else
    return [60, 60]
}

export function newDesktop(): Desktop {
  const altitudeSequence = sequence(0, increment)
  const windowPositionSequence = sequence([60, 60], downAndToTheRight)
  let windows: Array<Window> = []
  return {
    addWindow,
    getWindows,
    getFocusedWindow,
  }

  function addWindow(url: string, startingPosition: WindowStartingPosition) {
    const pos = getAbsolutePosition(startingPosition)
    windows = [
      ...getWindows(),
      newWindow(url, pos, altitudeSequence),
    ]
  }

  function getWindows(): Array<Window> {
    return windows.filter(w => !w.isClosed())
  }

  function getAbsolutePosition(l: WindowStartingPosition): Point {
    switch (l.type) {
      case "default":
        return windowPositionSequence()
      case "offset-from": {
        const [x, y] = l.origin
        return [x + 21, y + 21]
      }
      default:
        throw unreachable("WindowStartingPosition", l.type)
    }
  }

  function getFocusedWindow(): ?Window {
    const maxAltitude = max(getWindows().map(w => w.getAltitude()))
    return windows.find(w => w.getAltitude() === maxAltitude)
  }
}

function max(xs: Array<number>): number {
  return xs.reduce((top, x) => Math.max(top, x), -Infinity)
}

export function DesktopController(): React.Node {
  const [desktop, withUpdate] = useModel(newDesktop)
  useCrossFrameMessages(msg => {
    switch (msg.data.type) {
      case "path-os-open-window": {
        const focusedWindow = desktop.getFocusedWindow()
        const startingPosition = focusedWindow
          ? {
            type: "offset-from",
            origin: focusedWindow.getPosition(),
          }
          : {type: "default"}

        withUpdate(desktop.addWindow)(msg.data.url, startingPosition)
      }
    }
  })
  const windows = desktop.getWindows()
  const focusedWindow = desktop.getFocusedWindow()
  return <DesktopView onOpenWindowRequested={withUpdate(() => desktop.addWindow("https://duckduckgo.com", {type: "default"}))}>
    {windows.map(window =>
      <WindowController
        window={window}
        focused={window === focusedWindow}
        withUpdate={withUpdate}
        key={window.getId()}
      />
    )}
  </DesktopView>
}
