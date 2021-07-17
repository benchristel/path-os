// @flow

import {newSignal} from "./signal.js"
import type {NonEmptySignal} from "./signal.js"
import {cryptoRandomHex} from "./cryptoRandomHex.js"
import {httpify} from "./httpify.js"
import {test, expect, toEqual} from "./test-framework.js"
import {
  MENU_BAR_HEIGHT_PX,
  BOTTOM_LETTERBOX_HEIGHT_PX,
} from "./global-constants.js"

interface History {
  add(url: string): void,
  getCurrent(): string,
  goBack(): string,
}

function newHistory(initialUrl: string): History {
  let stack = [initialUrl, null]
  return {
    add,
    getCurrent,
    goBack,
  }

  function add(newUrl: string) {
    if (getCurrent() === newUrl) return;
    stack = [newUrl, stack]
  }

  function getCurrent(): string {
    return stack[0]
  }

  function goBack(): string {
    if (stack[1] != null) stack = stack[1]
    return stack[0]
  }
}

test("history", {
  "starts out at the given URL"() {
    expect(newHistory("fake url").getCurrent(), toEqual("fake url"))
  },
  "cannot go back from the initial URL"() {
    const history = newHistory("fake url")
    expect(history.goBack(), toEqual("fake url"))
    expect(history.getCurrent(), toEqual("fake url"))
  },
  "adds a new URL"() {
    const history = newHistory("old url")
    history.add("new url")
    expect(history.getCurrent(), toEqual("new url"))
  },
  "goes back"() {
    const history = newHistory("old url")
    history.add("new url")
    expect(history.goBack(), toEqual("old url"))
    expect(history.getCurrent(), toEqual("old url"))
  },
  "stores multiple levels of history"() {
    const history = newHistory("one")
    history.add("two")
    history.add("three")
    expect(history.getCurrent(), toEqual("three"))
    expect(history.goBack(), toEqual("two"))
    expect(history.goBack(), toEqual("one"))
    expect(history.goBack(), toEqual("one"))
  },
  "does not duplicate items at the top of the history"() {
    const history = newHistory("one")
    history.add("two")
    history.add("two")
    expect(history.goBack(), toEqual("one"))
  },
})

export type Window = {
  getId(): string,
  nudge(dx: number, dy: number): void,
  getX(): number,
  getY(): number,
  getWidth(): number,
  getHeight(): number,
  getAltitude(): number,
  focus(): void,
  noticeScreenDimensions(number, number): void,
  moveLeftEdge(number, number): void,
  getUrlBarText(): string,
  changeUrlBarText(string): void,
  navigate(): void,
  goBack(): void,
  getImposedNavigation(): NonEmptySignal<string>,
  noticeNewUrl(string): void,
  isClosed(): boolean,
  close(): void,
}

export function newWindow(initialUrl: string, nextAltitude: () => number): Window {
  const id = cryptoRandomHex(20)
  let altitude = 0
  let x = 60, y = 60 // position of the top left corner
  let width = 1024, height = 600
  let screenWidth = 1024, screenHeight = 768
  let urlBar = ""
  let history: History = newHistory(initialUrl)
  let closed = false
  // imposedNavigation updates whenever the browser chrome
  // initiates navigation (e.g. via the "back" button, or
  // the user typing a URL and hitting "enter"). As opposed
  // to navigation that arises "organically" from clicking
  // a hyperlink.
  let imposedNavigation = newSignal(initialUrl)
  focus()
  return {
    getId,
    nudge,
    getX, getY,
    getWidth, getHeight,
    getAltitude,
    focus,
    noticeScreenDimensions,
    moveLeftEdge,
    getUrlBarText,
    changeUrlBarText,
    navigate,
    goBack,
    getImposedNavigation,
    noticeNewUrl,
    isClosed,
    close,
  }

  function getId(): string {
    return id
  }

  function nudge(dx: number, dy: number) {
    x += dx
    y += dy
  }

  function getX(): number {
    if (x < -width + 20) return -width + 20
    if (x > screenWidth - 20) return screenWidth - 20
    return x
  }

  function getY(): number {
    if (y <= MENU_BAR_HEIGHT_PX) return MENU_BAR_HEIGHT_PX
    const maxY = screenHeight - BOTTOM_LETTERBOX_HEIGHT_PX - 20
    if (y > maxY) return maxY
    return y
  }

  function getWidth(): number {
    return width
  }

  function getHeight(): number {
    return height
  }

  function getAltitude(): number {
    return altitude
  }

  function focus() {
    if (closed) return;
    altitude = nextAltitude()
  }

  function noticeScreenDimensions(width: number, height: number) {
    [screenWidth, screenHeight] = [width, height]
  }

  function moveLeftEdge(dx: number, dy: number) {
    x += dx
    width -= dx
  }

  function getUrlBarText(): string {
    return urlBar
  }

  function changeUrlBarText(text: string) {
    urlBar = text
  }

  function getImposedNavigation(): NonEmptySignal<string> {
    return imposedNavigation
  }

  function navigate() {
    imposedNavigation = newSignal(httpify(urlBar))
    history.add(urlBar)
  }

  function goBack() {
    const url = history.goBack()
    urlBar = url
    imposedNavigation = newSignal(httpify(urlBar))
  }

  function noticeNewUrl(url: string) {
    urlBar = url
    history.add(urlBar)
  }

  function isClosed() {
    return closed
  }

  function close() {
    closed = true
  }
}
