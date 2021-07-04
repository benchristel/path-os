// @flow

import * as React from "react"
import {useModel} from "./useModel.js"
import {test, expect, toEqual} from "./test-framework.js"
import type {Signal} from "./signal.js"
import {newSignal, emptySignal} from "./signal.js"
import {TransientMessageBox} from "./transient-message-box.jsx"

type Model = {|
  cookies: () => number,
  makeCookie: () => mixed,
  eatCookie: () => mixed,
  canEatCookie: () => boolean,
  message: () => Signal<string>,
|}

export function newGame(): Model {
  let _cookies = 0;
  let _message = emptySignal()
  return {
    cookies,
    makeCookie,
    eatCookie,
    canEatCookie,
    message,
  }

  function cookies() {
    return _cookies
  }

  function makeCookie() {
    _cookies++
    if (_cookies === 5) {
      showMessage("Wow! 5 cookies!")
    }
  }

  function eatCookie() {
    if (!canEatCookie()) return;
    _cookies--
  }

  function canEatCookie() {
    return _cookies > 0
  }

  function message() {
    return _message
  }

  // private
  function showMessage(message: string) {
    _message = newSignal(message)
  }
}

test("a cookie clicker game", {
  "starts with no cookies"() {
    expect(newGame().cookies(), toEqual(0))
  },

  "adds cookies that are made"() {
    const game = newGame()
    game.makeCookie()
    expect(game.cookies(), toEqual(1))
  },

  "subtracts cookies eaten"() {
    const game = newGame()
    game.makeCookie()
    expect(game.canEatCookie(), toEqual(true))
    game.eatCookie()
    expect(game.cookies(), toEqual(0))
  },

  "does not allow negative cookies"() {
    const game = newGame()
    expect(game.canEatCookie(), toEqual(false))
    game.eatCookie()
    expect(game.cookies(), toEqual(0))
  },

  "shows no message initially"() {
    const game = newGame()
    expect(game.message().state, toEqual("empty"))
  },

  "celebrates 5 cookies made"() {
    const game = newGame()
    game.makeCookie()
    game.makeCookie()
    game.makeCookie()
    game.makeCookie()
    expect(game.message().state, toEqual("empty"))
    game.makeCookie()
    expect(game.message().state, toEqual("data"))
    expect(game.message().data || "", toEqual("Wow! 5 cookies!"))
  },
})

export function CookieClicker(): React.Node {
  const [game, withUpdate] = useModel(newGame)
  return <>
    <p>Cookies: {game.cookies()}</p>
    <button onClick={withUpdate(game.makeCookie)}>
      Make a Cookie
    </button>
    <button onClick={withUpdate(game.eatCookie)} disabled={!game.canEatCookie()}>
      Eat a Cookie
    </button>
    <TransientMessageBox message={game.message()}/>
  </>
}
