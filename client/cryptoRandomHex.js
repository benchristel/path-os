// @flow

import {test, expect, toEqual, toMatch, not} from "./test-framework.js"

export function cryptoRandomHex(bytes: number): string {
  const a = new Uint8Array(bytes)
  window.crypto.getRandomValues(a)
  return [...a]
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
}

test("cryptoRandomHex", {
  "returns empty string if asked for no bytes"() {
    expect(cryptoRandomHex(0), toEqual(""))
  },
  "returns two hex digits per byte"() {
    expect(cryptoRandomHex(10), toMatch(/^[0-9a-f]{20}$/))
  },
  "is at least kind of random"() {
    expect(cryptoRandomHex(10), not(toEqual(cryptoRandomHex(10))))
  },
})
