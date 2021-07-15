// @flow

export function sequence<T>(init: T, getNext: T => T): () => T {
  let state: T = init
  return function advance(): T {
    const current = state
    state = getNext(state)
    return current
  }
}
