// @flow

import * as React from "react"
import {useRef, useState} from "react"
import {css} from "emotion"
import type {Wrapper} from "./useModel.js"
import type {NonEmptySignal} from "./signal.js"

export type WindowViewModel =
  | BrandNew
  | Loading
  | Loaded

type BrandNew = {|
  state: "brand-new",
  id: string,
  urlBar: string,
  focused: boolean,
  zIndex: number,
  ...SizeAndPosition,
|}

type Loading = {|
  state: "loading",
  id: string,
  urlBar: string,
  focused: boolean,
  zIndex: number,
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
  focused: boolean,
  zIndex: number,
  iframe: IFrameViewModel,
  ...SizeAndPosition,
|}

type SizeAndPosition = {|
  width: number,
  height: number,
  top: number,
  left: number,
|}

type IFrameViewModel = {|
  src: NonEmptySignal<string>,
  handleLoaded: SyntheticEvent<HTMLIFrameElement> => mixed,
  handleWillUnload: () => mixed,
|}

type DocumentMetadata = {|
  title: string,
  url: string,
|}

export function WindowView(props: {|
  v: WindowViewModel,
  onMove: (dx: number, dy: number) => mixed,
  onMoveLeftEdge: (dx: number, dHeight: number) => mixed,
  onUrlEdited: string => mixed,
  onNavigationRequested: () => mixed,
  onFocusRequested: (id: string) => mixed,
|}): React.Node {
  const {v} = props
  const {width, height, top, left, zIndex} = v

  return <div
    style={{width, top, left, zIndex, position: ""}}
    className={css(styles.windowFrame)}
    key={v.id}
  >
    <WindowHead>
      <Handle
        onDrag={props.onMove}
      />
      <input
        value={v.urlBar}
        onChange={e => props.onUrlEdited(e.target.value)}
        onKeyDown={e => e.keyCode === 13 && props.onNavigationRequested()}
        style={{width: "100%", boxSizing: "border-box"}}
      />
    </WindowHead>
    <div style={{position: "relative"}}>
      {
        v.iframe && <WindowPane
          iframe={v.iframe}
          height={height}
          focused={v.focused}
        />
      }
      {
        !v.focused && <ClickInterceptor
          onClick={() => props.onFocusRequested(v.id)}
        />
      }
    </div>
    <LeftDragHandle
      height={height + 44}
      onDrag={dx => props.onMoveLeftEdge(dx, 0)}
    />
  </div>
}

function WindowHead(props: {|
  children: React.Node
|}): React.Node {
  return <div className={styles.windowHead}>
    {props.children}
  </div>
}

function WindowPane(props: {|
  iframe: IFrameViewModel,
  height: number,
  focused: boolean,
|}): React.Node {
  const {iframe, height, focused} = props
  return <iframe
    key={iframe.src.nonce}
    src={iframe.src.data}
    className={css(styles.iframe)}
    style={{height}}
    onLoad={iframe.handleLoaded}
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

function ClickInterceptor(props: {|onClick: () => mixed|}): React.Node {
  return <div
    onClick={props.onClick}
    style={{
      position: "absolute",
      inset: 0,
      top: -44,
    }}
  />
}

function WindowSill(props: {|
  onDragLeftCorner: () => mixed,
  onDragRightCorner: () => mixed,
  onDragMiddle: () => mixed,
|}): React.Node {
  return <div className={styles.windowSill}/>
}

function LeftDragHandle(props: {|
  height: number,
  onDrag: (dx: number, dy: number) => mixed,
|}): React.Node {
  const {height, onDrag} = props
  return <div
    style={{height}}
    className={styles.leftDragHandle}
    {...useDraggableBehavior({onDrag})}
  />
}

const trace: Wrapper = (f => (...args) => {
  console.log("trace", ...args)
  return f(...args)
}: any)

const styles = {
  windowFrame: {
    position: "absolute",
    boxShadow: "0 3px 30px #000c",
    borderRadius: "4px 4px 0 0",
    background: "#ddd",
  },
  windowHead: css`
    background: linear-gradient(to bottom, #eee, #ccc);
    border-top: 1px solid #fff;
    border-radius: 4px 4px 0 0;
    border-bottom: 1px solid #666;
  `,
  windowSill: css`
    display: none;
    border-radius: 0 0 2px 2px;
    border-top: 1px solid #888;
    background: linear-gradient(to bottom, #eee, #ccc);
    height: 6px;
  `,
  iframe: {
    // Without `display: block`, the iframe adds extra
    // margin beneath it.
    display: "block",
    border: "none",
    width: "100%",
  },
  leftDragHandle: css`
    position: absolute;
    top: 0;
    left: -4px;
    width: 7px;
    cursor: ew-resize;
  `,
}

function Handle(props: {|
  onDrag: (dx: number, dy: number) => mixed,
|}): React.Node {
  return <div
    style={{width: "100%", height: 22, borderRadius: "4px 4px 0 0", boxSizing: "border-box"}}
    {...useDraggableBehavior<HTMLDivElement>({onDrag: props.onDrag})}
  />
}

type DraggableCallbacks<E: HTMLElement> = {|
  ref: ?E => mixed,
  onPointerDown: SyntheticPointerEvent<E> => mixed,
  onPointerUp: SyntheticPointerEvent<E> => mixed,
  onPointerMove: MouseEvent => mixed,
|}

type DraggableOptions = {|
  onDrag: (dx: number, dy: number) => mixed,
  lock?: ?("horizontal" | "vertical"),
|}

function useDraggableBehavior<E: HTMLElement>(options: DraggableOptions): DraggableCallbacks<E> {
  const el = useRef(null)
  const [isDragging, setDragging] = useState(false)
  return {
    ref: _el => el.current = _el,
    onPointerDown: e => {
      setDragging(true)
      el.current?.setPointerCapture(e.pointerId)
    },
    onPointerUp: e => {
      setDragging(false)
      el.current?.releasePointerCapture(e.pointerId)
    },
    onPointerMove: e => {
      if (isDragging) options.onDrag(e.movementX, e.movementY)
    }
  }
}
