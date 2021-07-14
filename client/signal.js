// @flow

// A Signal<T> is a monoid representing a value of type T
// that changes over time.
//
// Signals are best used with Receiver<T>. A receiver
// provides an idempotent method ifUpdate that calls its
// callback when a change in the signal is detected.
//
// Every signal instance has a globally-unique timestamp
// that lets you determine which of two signal instances
// is more recent. This lets you do things like demultiplex
// any number of signals from various sources into a single
// signal.
//
// The "concat" operation required for monoid-hood is
// implemented by Signal.max, which returns the more recent
// of two signal values.
//
// The identity element, a signal which is less recent than
// all other signals and contains no data, can be obtained
// via emptySignal<T>().

let clock: number = 0

export type Signal<T> = EmptySignal<T> | NonEmptySignal<T>

export type EmptySignal<T> = $ReadOnly<{|
  state: "empty",
  max: Signal<T> => Signal<T>,
  isAfter: Signal<T> => false,
|}>

export type NonEmptySignal<T> = $ReadOnly<{|
  state: "data",
  data: T,
  nonce: number,
  max: Signal<T> => Signal<T>,
  isAfter: Signal<T> => boolean,
|}>

export function emptySignal<T>(): Signal<T> {
  const self = {
    state: "empty",
    max,
    isAfter,
  }
  return self

  function max(other: Signal<T>): Signal<T> {
    return other
  }

  function isAfter(other: Signal<T>): false {
    return false
  }
}

export function newSignal<T>(data: T): NonEmptySignal<T> {
  const nonce = clock++
  const self = {
    state: "data",
    data,
    nonce,
    max,
    isAfter,
  }
  return self

  function max(other: Signal<T>): Signal<T> {
    if (self.isAfter(other)) {
      return self
    } else {
      return other
    }
  }

  function isAfter(other: Signal<T>): boolean {
    return other.state === "empty" || nonce > other.nonce
  }
}

export type Receiver<T> = {|
  current: () => Signal<T>,
  ifUpdate: (Signal<T>, Signal<T> => mixed) => mixed,
|}

export function newReceiver<T>(): Receiver<T> {
  let _current = emptySignal<T>()
  return {
    current,
    ifUpdate,
  }

  function current() {
    return _current
  }

  function ifUpdate(newVal, ifCb: Signal<T> => mixed) {
    if (newVal.isAfter(_current)) {
      _current = newVal
      ifCb(newVal)
    }
  }
}
