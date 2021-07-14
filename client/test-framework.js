// @flow

import * as React from "react"

type TestCases = {[string]: () => mixed}

type Test = $ReadOnly<{|
  subject: string,
  behavior: string,
  run: () => mixed,
|}>

type TestResult = Pass | Fail

type Pass = $ReadOnly<{|
  status: "passed",
  subject: string,
  behavior: string,
|}>

type Fail = $ReadOnly<{|
  status: "failed",
  subject: string,
  behavior: string,
  error: Error,
|}>

const allTests: Array<Test> = []
export function test(subject: string, testCases: TestCases): void {
  for (let behavior of Object.keys(testCases)) {
    const run = testCases[behavior]
    allTests.push({subject, behavior, run})
  }
}

window.allTestResults = allTestResults
export function allTestResults(): Array<TestResult> {
  return allTests.map(t => {
    try {
      t.run()
      return {
        status: "passed",
        subject: t.subject,
        behavior: t.behavior,
      }
    } catch (error) {
      return {
        status: "failed",
        subject: t.subject,
        behavior: t.behavior,
        error,
      }
    }
  })
}

type Matcher<T> = {|
  expected: T,
  verb: string,
  (actual: T): boolean,
|}

export function expect<T: Textualizable>(subject: T, matcher: Matcher<T>): void {
  if (!matcher(subject)) {
    throw new TestFailure(subject, matcher.verb, matcher.expected)
  }
}

class TestFailure<T: Textualizable> extends Error {
  actual: T
  expected: T
  verb: string

  constructor(actual: T, verb: string, expected: T) {
    super()
    this.actual   = actual
    this.verb     = verb
    this.expected = expected
  }

  toString() {
    return `expected
  ${textualize(this.actual)}
${this.verb}
  ${textualize(this.expected)}`
  }
}

type Textualizable = string | number | boolean | null | void

export function toEqual<T: Textualizable>(expected: T): Matcher<T> {
  function matches(actual: T): boolean {
    return actual === expected
  }
  matches.verb = "to equal"
  matches.expected = expected
  return matches
}

export function toMatch(regex: RegExp): Matcher<string> {
  function matches(actual: string): boolean {
    return regex.test(actual)
  }
  matches.verb = "to match"
  matches.expected = regex
  return matches
}

export function not<T: Textualizable>(matcher: Matcher<T>): Matcher<T> {
  function matches(actual: T): boolean {
    return !matcher(actual)
  }
  matches.verb = "not " + matcher.verb
  matches.expected = matcher.expected
  return matches
}

function textualize(t: Textualizable): string {
  if (typeof t === "string")  return `"${escape(t)}"`
  if (typeof t === "number")  return String(t)
  if (typeof t === "boolean") return String(t)

  if (t === undefined) return "undefined"
  if (t === null)      return "null"

  return String(t)
}

function escape(s: string): string {
  return s
    .replace(/\\/g, `\\`)
    .replace(/\n/g, `\n`)
    .replace(/\t/g, `\t`)
    .replace(/"/g,  `\"`)
}
