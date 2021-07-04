// @flow

import {useRef, useState, useEffect} from "react"

export function useUrlHash(): string {
  const listener = useRef()
  const [hash, setHash] = useState(window.location.hash)

  useEffect(() => {
    window.removeEventListener("hashchange", listener.current)
    listener.current = () => setHash(window.location.hash)
    window.addEventListener("hashchange", listener.current)
    return () => window.removeEventListener("hashchange", listener.current)
  }, [])

  return hash
}
