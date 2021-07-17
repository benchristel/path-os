// @flow

import * as React from "react"
import {sequence} from "./sequence.js"
import {useCrossFrameMessages} from "./useCrossFrameMessages.js"
import {useModel} from "./useModel.js"
import {WindowController} from "./WindowController.jsx"
import {newWindow} from "./Window.js"
import type {Window} from "./Window.js"

const increment: number => number = a => a + 1

export type Desktop = {|
  addWindow(url: string): void,
  getWindows(): Array<Window>
|}

export function newDesktop(): Desktop {
  const altitudeSequence = sequence(0, increment)
  let windows: Array<Window> = [newWindow("http://example.com", altitudeSequence)]
  return {
    addWindow,
    getWindows,
  }

  function addWindow(url: string) {
    windows = [
      ...getWindows(),
      newWindow(url, altitudeSequence),
    ]
  }

  function getWindows(): Array<Window> {
    return windows.filter(w => !w.isClosed())
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
        key={window.getId()}
      />
    )}
  </>
}
