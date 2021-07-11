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
    {dayOfWeekAbbrev(now.getDay())}, {monthAbbrev(now.getMonth())} {now.getDate()}, {now.toLocaleTimeString()}
    <Timer onTick={redraw}/>
  </>
}

function monthAbbrev(m: number): string {
  switch (m) {
    case 0:  return "Jan"
    case 1:  return "Feb"
    case 2:  return "Mar"
    case 3:  return "Apr"
    case 4:  return "May"
    case 5:  return "Jun"
    case 6:  return "Jul"
    case 7:  return "Aug"
    case 8:  return "Sep"
    case 9:  return "Oct"
    case 10: return "Nov"
    case 11: return "Dec"
  }
  return "???"
}

function dayOfWeekAbbrev(d: number): string {
  switch (d) {
    case 0: return "Sun"
    case 1: return "Mon"
    case 2: return "Tue"
    case 3: return "Wed"
    case 4: return "Thu"
    case 5: return "Fri"
    case 6: return "Sat"
    case 7: return "Sun"
  }
  return "??"
}

const desktop = css`
  display: block;
  height: calc(100vh - ${MENU_BAR_HEIGHT_PX}px);
  position: relative;
  background: linear-gradient(to bottom, #0008, #0000 50px), url('galaxy-cropped.png');
  background-size: cover;
  background-position: center;
  overflow: hidden;
`

const footer = css`
  height: ${MENU_BAR_HEIGHT_PX}px;
  background: black;
`
