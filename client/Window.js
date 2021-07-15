// @flow

import {newSignal} from "./signal.js"
import type {NonEmptySignal} from "./signal.js"
import {cryptoRandomHex} from "./cryptoRandomHex.js"
import {httpify} from "./httpify.js"
import {
  MENU_BAR_HEIGHT_PX,
  BOTTOM_LETTERBOX_HEIGHT_PX,
} from "./global-constants.js"

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
  getNavigationViaUrlBar(): NonEmptySignal<string>,
}

export function newWindow(initialUrl: string, nextAltitude: () => number): Window {
  const id = cryptoRandomHex(20)
  let altitude = 0
  focus()
  let x = 60, y = 60 // position of the top left corner
  let width = 1024, height = 600
  let screenWidth = 1024, screenHeight = 768
  let urlBar = ""
  // a signal that updates whenever the user jumps to a new
  // page by typing in the URL bar and hitting "Return"
  let navigationViaUrlBar = newSignal(initialUrl)
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
    getNavigationViaUrlBar,
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

  function getNavigationViaUrlBar(): NonEmptySignal<string> {
    return navigationViaUrlBar
  }

  function navigate() {
    navigationViaUrlBar = newSignal(httpify(urlBar))
  }
}
