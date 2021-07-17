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
  onFocusRequested: () => mixed,
  onBackButtonClicked: () => mixed,
  onCloseRequested: () => mixed
|}): React.Node {
  const {v} = props
  const {width, height, top, left, zIndex} = v

  function focus() {
    !v.focused && props.onFocusRequested()
  }

  return <div
    style={{width, top, left, zIndex}}
    className={css(styles.windowFrame)}
    key={v.id}
  >
    <WindowHead>
      <Handle onDrag={props.onMove} onMouseDown={focus}/>
      <Button onClick={props.onCloseRequested} style={styles.closeButton}> </Button>
      <Button onClick={props.onBackButtonClicked} style={styles.backButton} onMouseDown={focus}>
        ◀︎
      </Button>
      <input
        value={v.urlBar}
        onMouseDown={focus}
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
      {!v.focused && <ClickInterceptor onClick={focus}/>}
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
    onMouseDown={props.onClick}
    style={{
      position: "absolute",
      inset: 0,
    }}
  />
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
  onMouseDown: () => mixed,
|}): React.Node {
  return <div
    style={{width: "100%", height: 22, borderRadius: "4px 4px 0 0", boxSizing: "border-box"}}
    {...useDraggableBehavior<HTMLDivElement>({onDrag: props.onDrag})}
    onMouseDown={props.onMouseDown}
  />
}

function Button(props: {|
  children: React.Node,
  onClick: () => mixed,
  onMouseDown?: ?() => mixed,
  style: Object,
|}): React.Node {
  return <button
    style={{...styles.button, ...props.style}}
    onClick={props.onClick}
    onMouseDown={props.onMouseDown}
  >{props.children}</button>
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
    background: linear-gradient(to bottom, #eee, #aaa);
    border-top: 1px solid #fff;
    border-radius: 4px 4px 0 0;
    border-bottom: 1px solid #666;
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
    border-top:    1px solid #666;
    border-left:   1px solid #808080;
    border-bottom: 1px solid #777;
    border-right:  1px solid #909090;
    border-radius: 3px;
    box-shadow: inset 0 1px 5px #0002, 1px 1px #fff6;
  `,
  urlBar: {
    position: "absolute",
    width: "calc(100% - 50px)",
    height: "20px",
    boxSizing: "border-box",
    left: "43px",
    bottom: "6px",
    borderRadius: "0 3px 3px 0",
    paddingLeft: "4px",
  },
  button: {
    fontSize: "10px",
    color: "#444",
    textShadow: "0 1px #fff6",
    background: "linear-gradient(to bottom, #fff3, #00000018)",
    border: "1px solid #666",
    borderRadius: "3px",
    boxShadow: "inset 1px 1px #fff7, 1px 1px #fff6",
    cursor: "pointer",
  },
  backButton: {
    position: "absolute",
    left: "6px",
    width: "38px",
    height: "20px",
    lineHeight: "18px",
    bottom: "6px",
    borderRadius: "3px 0 0 3px",
  },
  closeButton: {
    position: "absolute",
    top: "3px",
    left: "6px",
    height: "14px",
    width: "14px",
    padding: "0",
    boxSizing: "border-box",
    border: "1px solid #222",
    borderRadius: "100px",
    background: "linear-gradient(120deg, #f00, #f000 35%), linear-gradient(-120deg, #f00, #f000 35%), linear-gradient(to bottom, #f00 0%, #faa 20%, #d00 30%, #f88 90%)",
    boxShadow: "inset 0 0 3px #0009, 1px 1px #fff6"
  }
}
