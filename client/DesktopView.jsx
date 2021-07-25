// @flow

import * as React from "react"
import {BOTTOM_LETTERBOX_HEIGHT_PX} from "./global-constants.js"
import {css} from "./css.js"

export function DesktopView(props: {|
  children: React.Node,
  onOpenWindowRequested: () => mixed,
|}): React.Node {
  function handleRightClick(e: MouseEvent) {
    if (e.button !== 2) return;
    e.stopPropagation()
    props.onOpenWindowRequested()
    return false
  }

  return <main className="Desktop" onMouseDown={handleRightClick}>
    {props.children}
  </main>
}

css`
.Desktop {
  display: block;
  height: calc(100vh - ${BOTTOM_LETTERBOX_HEIGHT_PX}px);
  position: relative;
  background: linear-gradient(to bottom, #0008, #0000 50px), url('galaxy-cropped.png');
  background-size: cover;
  background-position: center;
  overflow: hidden;
}
`
