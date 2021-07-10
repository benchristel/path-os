// @flow

import * as React from "react"
import {useRef, useState} from "react"
import {css} from "emotion"
import type {Wrapper} from "./useModel.js"

export type WindowViewModel =
  | BrandNew
  | Loading
  | Loaded

type SizeAndPosition = {|
  width: number,
  height: number,
  top: number,
  left: number,
|}

type IFrameViewModel = {|
  src: string,
  nonce: number,
  handleLoaded: SyntheticEvent<HTMLIFrameElement> => mixed,
  handleMetadata: DocumentMetadata => mixed,
  handleWillUnload: () => mixed,
  handleActivateLink: (url: string) => mixed,
  handleHoverLink: (url: string) => mixed,
|}

type DocumentMetadata = {|
  title: string,
  url: string,
|}

type BrandNew = {|
  state: "brand-new",
  id: string,
  urlBar: string,
  ...SizeAndPosition,
|}

type Loading = {|
  state: "loading",
  id: string,
  urlBar: string,
  iframe: IFrameViewModel,
  ...SizeAndPosition,
|}

// A window transitions to Loaded state once we've injected
// our code into it and received a message that confirms the
// document is ready and tells us the canonical URL of the
// page.
type Loaded = {|
  state: "loaded",
  id: string,
  urlBar: string,
  iframe: IFrameViewModel,
  ...SizeAndPosition,
|}

export function WindowView(props: {|
  v: WindowViewModel,
  onMove: (dx: number, dy: number) => mixed
|}): React.Node {
  const {v} = props
  const {width, height, top, left} = v

  return <div
    style={{width, height, top, left}}
    className={css(styles.windowFrame)}
  >
    <Handle onDrag={props.onMove}/>
    <input value={v.urlBar}/>
    {
      v.iframe && <iframe
        key={v.iframe.nonce}
        src={v.iframe.src}
        className={css(styles.iframe)}
        onLoad={v.iframe.handleLoaded}
        sandbox={[
          "allow-downloads",
          "allow-forms",
          "allow-pointer-lock",
          "allow-presentation",
          "allow-scripts",
          "allow-same-origin",
        ].join(" ")}
      />
    }

    {
      v.state === "loading" && <Curtain/>
    }
  </div>
}

const trace: Wrapper = (f => (...args) => {
  console.log("trace", ...args)
  return f(...args)
}: any)

function Curtain(): React.Node {
  return <div className={css(styles.curtain)}/>
}

const styles = {
  windowFrame: {
    position: "absolute",
    boxShadow: "0 3px 30px #000c"
  },
  curtain: {
    width: "100%",
    height: "100%",
    backgroundColor: "#fff",
  },
  iframe: {
    border: "none",
    width: "100%",
    height: "calc(100% - 44px)",
    position: "absolute",
    bottom: 0,
    left: 0,
  }
}

function Handle(props: {|
  onDrag: (dx: number, dy: number) => mixed,
|}): React.Node {
  const el = useRef(null)
  const [isDragging, setDragging] = useState(false)
  return <div
    style={{width: "100%", height: 22, background: "linear-gradient(to bottom, #eee, #ccc)", borderRadius: "4px 4px 0 0", borderTop: "1px solid #fff", borderBottom: "1px solid #aaa", boxSizing: "border-box"}}
    ref={_el => el.current = _el}
    onPointerDown={e => {
      setDragging(true)
      el.current?.setPointerCapture(e.pointerId)
    }}
    onPointerUp={e => {
      setDragging(false)
      el.current?.releasePointerCapture(e.pointerId)
    }}
    onPointerMove={e => {
      if (isDragging) props.onDrag(e.movementX, e.movementY)
    }}
  />
}
