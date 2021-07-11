// @flow

import * as React from "react"
import {test, expect, toEqual} from "./test-framework.js"
import {useModel} from "./useModel.js"
import type {Wrapper} from "./useModel.js"
import {newSignal, emptySignal, newReceiver} from "./signal.js"
import type {Signal, Receiver} from "./signal.js"
import {Timer} from "./Timer.js"

test("a transient message box", {
  "starts blank"() {
    const box = newTransientMessageBox()
    expect(box.text(), toEqual(null))
  },

  "displays a message given to it"() {
    // const box = TransientMessageBox()
    // box.receive(newSignal("hi"))
    // expect(box.text(), toEqual("hi"))
    // expect(box.canDismiss(), toEqual(true))
  },

  "dismisses itself after 3 seconds"() {
    // const box = TransientMessageBox()
    // box.displayMessage("hi", 0)
    // box.tick(2999) // milliseconds
    // expect(box.text(), toEqual("hi"))
    // expect(box.canDismiss(), toEqual(true))
    // box.tick(1)
    // expect(box.text(), toEqual(""))
    // expect(box.canDismiss(), toEqual(false))
  },

  "resets the timer if a new message appears"() {
    // const box = TransientMessageBox()
    // box.displayMessage("one", 0)
    // box.tick(2999) // milliseconds
    // box.displayMessage("two", 0)
    // box.tick(2999)
    // expect(box.text(), toEqual("two"))
  },

  "resets the timer if the message nonce changes"() {
    // const box = TransientMessageBox()
    // box.displayMessage("one", 0)
    // box.tick(2999) // milliseconds
    // box.displayMessage("one", 1)
    // box.tick(2999)
    // expect(box.text(), toEqual("one"))
  },

  "does not reset the timer if nothing changes"() {
    // const box = TransientMessageBox()
    // box.displayMessage("one", 0)
    // box.tick(2999) // milliseconds
    // box.displayMessage("one", 0)
    // box.tick(1)
    // expect(box.text(), toEqual(""))
  },

  "can be dismissed before the timer expires"() {
    // const box = TransientMessageBox()
    // box.displayMessage("one", 0)
    // box.tick(2999) // milliseconds
    // box.displayMessage("two", 0)
    // box.tick(2999)
    // expect(box.text(), toEqual("two"))
  },
})

type Model = $ReadOnly<{|
  receive: Signal<string> => mixed,
  tick: number => mixed,
  text: () => ?string,
  dismiss: () => mixed,
|}>

export function newTransientMessageBox(): Model {
  const contents: Receiver<string> = newReceiver()
  let dismissCountdown: number = 0

  return {
    receive,
    tick,
    text,
    dismiss,
  }

  function receive(newVal: Signal<string>) {
    contents.ifUpdate(newVal, () => dismissCountdown = 3000)
  }

  function tick(ms: number) {
    dismissCountdown -= ms
  }

  function text(): ?string {
    const current = contents.current()
    if (current.state === "empty" || dismissCountdown <= 0) {
      return null
    } else {
      return current.data
    }
  }

  function dismiss() {
    dismissCountdown = 0
  }
}

type Props = {|
  message: Signal<string>
|}

export function TransientMessageBox(props: Props): React.Node {
  const [msgBox, withRedraw] = useModel(newTransientMessageBox)

  msgBox.receive(props.message)

  return view(msgBox, withRedraw)
}

function view(msgBox: Model, withRedraw: Wrapper): React.Node {
  const text = msgBox.text()
  if (text == null) return null

  return <div>
    <p>{text}</p>
    <button onClick={withRedraw(msgBox.dismiss)}>
      Close
    </button>
    <Timer onTick={withRedraw(msgBox.tick)}/>
  </div>
}
