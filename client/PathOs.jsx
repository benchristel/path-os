// @flow
import * as React from "react"
import {css} from "emotion"
import {DesktopController} from "./DesktopController.jsx"
import {
  BOTTOM_LETTERBOX_HEIGHT_PX,
} from "./global-constants.js"
import {ClockController} from "./Clock.jsx"

export function PathOs(): React.Node {
  return <>
    <DesktopController/>
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
          <ClockController/>
        </div>
      </div>
    </header>
    <footer className={css(footer)}/>
  </>
}

const footer = css`
  height: ${BOTTOM_LETTERBOX_HEIGHT_PX}px;
  background: black;
`
