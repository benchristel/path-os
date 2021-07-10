// @flow

import * as React from "react"
import {TestResults} from "./TestResults.jsx"
import {PathOs} from "./PathOs.jsx"
import {newRouter} from './Router.jsx'
import {newSignal} from "./signal.js"
import {useUrlHash} from "./useUrlHash.js"

const router = newRouter<React.Node>(
  <PathOs/>, // default
  {
    "/": <PathOs/>,
    "/tests": <TestResults/>,
  },
)

export function App(): React.Node {
  return <>
    {router(useUrlHash())}
  </>
}
