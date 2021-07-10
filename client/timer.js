// @flow

import * as React from "react"

export function Timer(props: {|
  onTick: number => mixed,
|}): React.Node {
  useAnimationFrame(props.onTick)
  return null
}

function useAnimationFrame(callback: number => mixed) {
  const frame = React.useRef()
  const time = React.useRef(performance.now())

  function handleFrame(newTime) {
    const now = performance.now();
    const dt = now - time.current
    callback(dt)
    time.current = now
    frame.current = requestAnimationFrame(handleFrame)
  }

  React.useEffect(() => {
    frame.current = requestAnimationFrame(handleFrame)
    return () => {
      frame.current != null && cancelAnimationFrame(frame.current)
    }
  }, [])
}
