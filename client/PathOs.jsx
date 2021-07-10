// @flow
import * as React from "react"
import {css} from "emotion"
import {WindowController} from "./WindowController.jsx"
import {
  MENU_BAR_HEIGHT_PX,
  BOTTOM_LETTERBOX_HEIGHT_PX,
} from "./global-constants.js"
import {useRedraw} from "./useRedraw.js"
import {Timer} from "./timer.js"

export function PathOs(): React.Node {
  return <>
    <main className={desktop}>
      <WindowController/>
    </main>
    <header id="menu-bar">
      <div className="menu-top-level menu-item">
        <div className="menu-label">System</div>
        <div className="menu-dropdown">
          <div className="menu-item">
            <div className="menu-label">Exit Fullscreen</div>
          </div>
        </div>
      </div>
      <div className="menu-top-level menu-item">
        <div className="menu-label">File</div>
      </div>
      <div className="menu-top-level menu-toolbar">
        <div className="menu-label">
          <Clock/>
        </div>
      </div>
    </header>
    <footer className={css(footer)}/>
  </>
}

function Clock(): React.Node {
  const redraw = useRedraw()
  const now = new Date()
  return <>
    {now.toLocaleTimeString()}&nbsp;&nbsp;{now.toLocaleDateString()}
    <Timer onTick={redraw}/>
  </>
}

const desktop = css`
  display: block;
  height: calc(100vh - ${MENU_BAR_HEIGHT_PX}px);
  position: relative;
  background: url('galaxy-cropped.png');
  background-size: cover;
  background-position: center;
  overflow: hidden;
`

const footer = css`
  height: ${MENU_BAR_HEIGHT_PX}px;
  background: black;
`
