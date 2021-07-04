// @flow

import * as React from "react"
import {test, expect, toEqual} from "./test-framework.js"
import {newSignal} from "./signal.js"
import type {Signal} from "./signal.js"

type Router<T> = (T, {[string]: T}) => string => T

test("a Router", {
  "defaults when the input is not found in the routes map"() {
    const router = newRouter("the default", {})
    expect(router("#/about"), toEqual("the default"))
  },

  "selects the right value"() {
    const router = newRouter(0, {
      "/one": 1,
      "/two": 2,
    })
    expect(router("#/one"), toEqual(1))
    expect(router("#/two"), toEqual(2))
  },

  "displays / when the hash is empty"() {
    const router = newRouter("the default", {
      "/": "homepage",
    })
    expect(router("#"),  toEqual("homepage"))
  },
})

export function newRouter<T>(
  _default: T,
  routes: {[string]: T},
): string => T {
  return hash => {
    const route = hash.slice(1) || "/"
    return route in routes ? routes[route] : _default
  }
}
