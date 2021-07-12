// @flow

import {useRef, useEffect} from "react"

export function useCrossFrameMessages<Msg>(onMessage: Msg => mixed) {
  const listener = useRef(null)
  useEffect(() => {
    window.addEventListener("message", onMessage)
    listener.current = onMessage
    return () => window.removeEventListener("message", listener.current)
  })
}
