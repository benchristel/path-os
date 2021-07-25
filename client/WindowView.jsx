// @flow

import * as React from "react"
import {useRef, useState} from "react"
import {css} from "./css.js"
import type {Wrapper} from "./useModel.js"
import type {NonEmptySignal} from "./signal.js"
import {useDraggableBehavior} from "./useDraggableBehavior.js"
import {
  WINDOW_HEAD_HEIGHT_PX,
  GROOVE_HIGHLIGHT,
  RECESS_SHADOW,
} from "./global-constants.js"
import type {Point} from "./Point.js"

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
  position: Point,
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
  onMoveLeftEdge: (dx: number) => mixed,
  onMoveRightEdge: (dx: number) => mixed,
  onMoveBottomEdge: (dy: number) => mixed,
  onUrlEdited: string => mixed,
  onNavigationRequested: () => mixed,
  onFocusRequested: () => mixed,
  onBackButtonClicked: () => mixed,
  onCloseRequested: () => mixed
|}): React.Node {
  const {v} = props
  const {width, height, position: [left, top], zIndex} = v

  function focus() {
    !v.focused && props.onFocusRequested()
  }

  return <div
    style={{width, top, left, zIndex}}
    className="Window"
    key={v.id}
  >
    <WindowHead>
      <Handle
        onDrag={props.onMove}
        onMouseDown={focus}
      />
      <Button
        onClick={props.onCloseRequested}
        className="close"
      />
      <Button
        onClick={props.onBackButtonClicked}
        onMouseDown={focus}
        className="back"
      >
        ◀︎
      </Button>
      <input
        value={v.urlBar}
        onMouseDown={focus}
        onChange={e => props.onUrlEdited(e.target.value)}
        onKeyDown={e => e.keyCode === 13 && props.onNavigationRequested()}
        className="UrlBar"
      />
    </WindowHead>
    <div style={{position: "relative"}}>
      {
        v.iframe && <WindowPane
          iframe={v.iframe}
          height={height - WINDOW_HEAD_HEIGHT_PX}
          focused={v.focused}
        />
      }
      {!v.focused && <ClickInterceptor onClick={focus}/>}
    </div>
    <SideDragHandle
      className="left"
      onDrag={props.onMoveLeftEdge}
    />
    <BottomDragHandle
      onDrag={props.onMoveBottomEdge}
    />
    <SideDragHandle
      className="right"
      onDrag={props.onMoveRightEdge}
    />
    <CornerDragHandle
      className="bottomLeft"
      onDrag={(dx, dy) => {
        props.onMoveLeftEdge(dx)
        props.onMoveBottomEdge(dy)
      }}
    />
    <CornerDragHandle
      className="bottomRight"
      onDrag={(dx, dy) => {
        props.onMoveRightEdge(dx)
        props.onMoveBottomEdge(dy)
      }}
    />
  </div>
}

function WindowHead(props: {|
  children: React.Node
|}): React.Node {
  return <div className="Head">
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

function SideDragHandle(props: {|
  onDrag: (dx: number) => mixed,
  className: string,
|}): React.Node {
  const {onDrag, className} = props
  return <div
    className={"sideDragHandle " + className}
    {...useDraggableBehavior({onDrag})}
  />
}

function BottomDragHandle(props: {|
  onDrag: (dy: number) => mixed,
|}): React.Node {
  const onDrag = (_, dy) => props.onDrag(dy)
  return <div
    className="bottomDragHandle"
    {...useDraggableBehavior({onDrag})}
  />
}

function CornerDragHandle(props: {|
  className: string,
  onDrag: (dx: number, dy: number) => mixed,
|}): React.Node {
  const {className, onDrag} = props
  return <div
    className={"cornerDragHandle " + className}
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
  children?: React.Node,
  onClick: () => mixed,
  onMouseDown?: ?() => mixed,
  className: string,
|}): React.Node {
  return <button
    onClick={props.onClick}
    onMouseDown={props.onMouseDown}
    className={"button " + props.className || "default"}
  >
    {props.children}
  </button>
}

css`
  .Window {
    position: absolute;
    box-shadow: 0 3px 30px #000c;
    border-radius: 4px 4px 0 0;
    background: #ddd;
  }

  .Window .Head {
    position: relative;
    height: ${WINDOW_HEAD_HEIGHT_PX}px;
    background: linear-gradient(to bottom, #eee, #aaa);
    border-radius: 4px 4px 0 0;
    border-top: 1px solid #fff;
    border-bottom: 1px solid #666;
  }

  .Window iframe {
    /* Without 'display: block', the iframe adds extra
     * margin beneath it. */
    display: block;
    border: none;
    width: 100%;
  }

  .Window .sideDragHandle {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 7px;
    cursor: ew-resize;
  }

  .Window .left.sideDragHandle {
    left: -4px;
  }

  .Window .right.sideDragHandle {
    right: -4px;
  }

  .Window .bottomDragHandle {
    position: absolute;
    bottom: -4px;
    width: 100%;
    height: 7px;
    cursor: ns-resize;
  }

  .Window .cornerDragHandle {
    position: absolute;
    width: 10px;
    height: 10px;
  }

  .Window .bottomLeft.cornerDragHandle {
    bottom: -4px;
    left: -4px;
    cursor: nesw-resize;
  }

  .Window .bottomRight.cornerDragHandle {
    bottom: -4px;
    right: -4px;
    cursor: nwse-resize;
  }

  .close.button {
    position: absolute;
    top: 3px;
    left: 6px;
    height: 14px;
    width: 14px;
    padding: 0;
    box-sizing: border-box;
    border: 1px solid #222;
    border-radius: 100px;
    background:
      linear-gradient(120deg, #f00, #f000 35%), linear-gradient(-120deg, #f00, #f000 35%),
      linear-gradient(to bottom, #f00 0%, #faa 20%, #d00 30%, #f88 90%);
    box-shadow: inset 0 0 3px #0009, ${GROOVE_HIGHLIGHT};
  }

  .back.button {
    position: absolute;
    left: 6px;
    width: 38px;
    height: 20px;
    bottom: 6px;
    border-radius: 3px 0 0 3px;
  }

  .button {
    font-size: 10px;
    color: #444;
    text-shadow: 0 1px #fff6;
    background: linear-gradient(to bottom, #fff3, #00000018);
    border: 1px solid #666;
    border-radius: 3px;
    box-shadow: inset ${GROOVE_HIGHLIGHT}, ${GROOVE_HIGHLIGHT};
    cursor: pointer;
  }

  .back.button:active {
    background: #0001;
    box-shadow: ${RECESS_SHADOW}, ${GROOVE_HIGHLIGHT};
  }

  .close.button:active {
    box-shadow: inset 0 0 5px #000d, ${GROOVE_HIGHLIGHT};
  }

  input {
    border-top:    1px solid #666;
    border-left:   1px solid #808080;
    border-bottom: 1px solid #777;
    border-right:  1px solid #909090;
    border-radius: 3px;
    box-shadow: inset 0 1px 5px #0002, 1px 1px #fff6;
  }

  input.UrlBar {
    position: absolute;
    width: calc(100% - 48px);
    height: 20px;
    box-sizing: border-box;
    left: 42px;
    bottom: 6px;
    border-radius: 0 3px 3px 0;
    border-left: 1px solid #666;
    padding-left: 4px;
  }
`
