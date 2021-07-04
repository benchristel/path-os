// @flow

import * as React from "react"
import {allTestResults} from "./test-framework.js"

export function TestResults(): React.Node {
  const results = allTestResults()
    .filter(r => r.status !== "passed")
    .map(viewFailure)
    .join("\n\n") || "ALL TESTS PASSED"

  return <code><pre>{results}</pre></code>
}

function viewFailure(failure) {
  if (failure.status === "passed") return ""
  return `${failure.subject} ➤ ${failure.behavior}:` + "\n"
    + indent(failure.error.toString())
}

function indent(text) {
  return "  " + text.replace(/\n/g, "\n  ")
}
