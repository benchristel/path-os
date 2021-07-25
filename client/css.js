// @flow

import {test, expect, toEqual} from "./test-framework.js"

window.cssDeclarations = []

export function css(styles: Array<string>, ...args: Array<mixed>) {
  window.cssDeclarations.push(intercalate(styles, args).join(""))
}

function intercalate<T>(a: $ReadOnlyArray<T>, b: $ReadOnlyArray<T>): Array<T> {
  const ret = []
  const len = Math.min(a.length, b.length)
  for (let i = 0; i < len; i++) {
    ret.push(a[i], b[i])
  }
  ret.push(...a.slice(len), ...b.slice(len))
  return ret
}

test("intercalate", {
  "returns an empty array given two"() {
    expect(intercalate([], []), toEqual([]))
  },

  "alternates elements, starting with the first array"() {
    expect(intercalate([0], [1]), toEqual([0, 1]))
    expect(intercalate([0, 2], [1, 3]), toEqual([0, 1, 2, 3]))
  },

  "appends extra elements to the end"() {
    expect(intercalate([], [1]), toEqual([1]))
    expect(intercalate([2], []), toEqual([2]))
  },

  "alternates elements and appends the rest"() {
    expect(intercalate([1, 3], [2, 4, 5, 6]), toEqual([1, 2, 3, 4, 5, 6]))
    expect(intercalate([6, 8, 10, 11], [7, 9]), toEqual([6, 7, 8, 9, 10, 11]))
  },
})
