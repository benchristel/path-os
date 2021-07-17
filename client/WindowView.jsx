// @flow

import * as React from "react"
import {useRef, useState} from "react"
import {css} from "emotion"
import type {Wrapper} from "./useModel.js"
import type {NonEmptySignal} from "./signal.js"
import {useDraggableBehavior} from "./useDraggableBehavior.js"
import {WINDOW_HEAD_HEIGHT_PX} from "./global-constants.js"

export type WindowViewModel =
  | Loading
  | Loaded

type Loading = {|
  state: "loading",
  id: string,
  urlBar: string,
  focused: boolean,
  zIndex: number,
  iframe: IFrameViewModel,
  ...SizeAndPosition,
|}

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
    style={{width, top, left, zIndex}}
    className={css(styles.windowFrame)}
    key={v.id}
  >
    <WindowHead>
      <Handle onDrag={props.onMove}/>
      <input
        value={v.urlBar}
        onChange={e => props.onUrlEdited(e.target.value)}
        onKeyDown={e => e.keyCode === 13 && props.onNavigationRequested()}
        className={css(styles.input, styles.urlBar)}
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
      height={height + WINDOW_HEAD_HEIGHT_PX}
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
      top: -WINDOW_HEAD_HEIGHT_PX,
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

function Handle(props: {|
  onDrag: (dx: number, dy: number) => mixed,
|}): React.Node {
  return <div
    style={{width: "100%", height: 22, borderRadius: "4px 4px 0 0", boxSizing: "border-box"}}
    {...useDraggableBehavior<HTMLDivElement>({onDrag: props.onDrag})}
  />
}

const styles = {
  windowFrame: {
    position: "absolute",
    boxShadow: "0 3px 30px #000c",
    borderRadius: "4px 4px 0 0",
    background: "#ddd",
  },
  windowHead: css`
    position: relative;
    height: ${WINDOW_HEAD_HEIGHT_PX}px;
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
  input: css`
    /* border-top:    1px solid #707070;
    border-left:   1px solid #808080;
    border-bottom: 1px solid #989898;
    border-right:  1px solid #909090; */
    border-top:    1px solid #0007;
    border-left:   1px solid #0006;
    border-bottom: 1px solid #ffffff08;
    border-right:  1px solid #fff1;
    border-radius: 3px;
    box-shadow: inset 0 1px 5px #0002;
  `,
  urlBar: {
    position: "absolute",
    width: "calc(100% - 6px)",
    boxSizing: "border-box",
    left: "3px",
    bottom: "3px",
  },
}
