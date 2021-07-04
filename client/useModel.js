// @flow

import {useState} from "react"

export type Wrapper = <F: Function>(F) => F

let nonce: number = 0
export function useModel<T>(factory: () => T): [T, Wrapper] {
  const [object] = useState(factory)
  const [_, setNonce] = useState(0)
  const rerender = () => setNonce(++nonce)
  const withUpdate: any = (f) => (...args) => {
    const result = f(...args)
    rerender()
    return result;
  }
  return [object, withUpdate]
}
