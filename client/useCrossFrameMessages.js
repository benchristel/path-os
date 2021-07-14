// @flow

import {useRef, useEffect} from "react"

type Message = {|
  data: {|
    type: "path-os-open-window",
    url: string,
  |},
|}

export function useCrossFrameMessages(onMessage: Message => mixed) {
  const listener = useRef(null)
  useEffect(() => {
    window.addEventListener("message", onMessage)
    listener.current = onMessage
    return () => window.removeEventListener("message", listener.current)
  })
}
