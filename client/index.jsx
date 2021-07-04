// @flow

import * as React from 'react'
import ReactDOM from 'react-dom'
import {App} from './App.jsx'
import {allTestResults} from "./test-framework.js"

ReactDOM.render(
  <App/>,
  document.getElementById("root"),
)

console.log("test results:", allTestResults())
