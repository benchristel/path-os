// @flow

import {test, expect, toEqual} from "./test-framework.js"

export function httpify(url: string): string {
  const allowedSchemes = /^(https?|file):\/\//
  if (allowedSchemes.test(url)) return url
  return url.replace(/^(https?)?:?\/?\/?/, function(_, scheme) {
    return (scheme || "http") + "://"
  })
}

test("httpify", {
  "passes through an http url unchanged"() {
    expect(
      httpify("http://google.com"),
      toEqual("http://google.com"))
  },
  "passes through an https url unchanged"() {
    expect(
      httpify("https://google.com"),
      toEqual("https://google.com"))
  },
  "adds http://"() {
    expect(
      httpify("example.com"),
      toEqual("http://example.com"))
  },
  "adds http:// to an archive url"() {
    expect(
      httpify("archive.org/http://example.com"),
      toEqual("http://archive.org/http://example.com"))
  },
  "adds http to a url starting with ://"() {
    expect(
      httpify("://example.com"),
      toEqual("http://example.com"))
  },
  "allows file urls"() {
    expect(
      httpify("file:///foo/bar"),
      toEqual("file:///foo/bar"))
  },
  "fixes a mistyped scheme separator"() {
    expect(
      httpify("http:example.com"),
      toEqual("http://example.com"))
  },
  "fixes a mistyped https scheme separator"() {
    expect(
      httpify("https:example.com"),
      toEqual("https://example.com"))
  },
  "infers http if there is no scheme before the separator"() {
    expect(
      httpify(":/example.com"),
      toEqual("http://example.com"))
  },
})
