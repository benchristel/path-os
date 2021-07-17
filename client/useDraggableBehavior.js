// @flow

import {useRef, useState} from "react"

type DraggableCallbacks<E: HTMLElement> = {|
  ref: ?E => mixed,
  onPointerDown: SyntheticPointerEvent<E> => mixed,
  onPointerUp: SyntheticPointerEvent<E> => mixed,
  onPointerMove: MouseEvent => mixed,
|}

export function useDraggableBehavior<E: HTMLElement>(
  options: {|onDrag: (dx: number, dy: number) => mixed|},
): DraggableCallbacks<E> {
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
