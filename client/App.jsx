// @flow

import * as React from "react"
import {CookieClicker} from "./cookie-clicker.jsx"
import {TestResults} from "./TestResults.jsx"
import {newRouter} from './Router.jsx'
import {newSignal} from "./signal.js"
import {useUrlHash} from "./useUrlHash.js"

const router = newRouter<React.Node>(
  <CookieClicker/>, // default
  {
    "/": <CookieClicker/>,
    "/tests": <TestResults/>,
  },
)

export function App(): React.Node {
  return <>
    <nav>
      <a href="#">home</a>{" | "}
      <a href="#/tests">tests</a>
    </nav>
    {router(useUrlHash())}
  </>
}
