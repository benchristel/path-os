// @flow

import * as React from "react"
import {useRedraw} from "./useRedraw.js"
import {Timer} from "./Timer.js"

export function ClockController(): React.Node {
  const redraw = useRedraw()
  return <>
    <ClockView now={new Date()}/>
    <Timer onTick={redraw}/>
  </>
}

function ClockView(props: {|
  now: Date,
|}): React.Node {
  const {now} = props
  return <>
    {dayOfWeekAbbrev(now.getDay())}{", "}
    {monthAbbrev(now.getMonth())}{" "}
    {now.getDate()}{", "}
    {now.toLocaleTimeString()}
  </>
}

function monthAbbrev(m: number): string {
  switch (m) {
    case 0:  return "Jan"
    case 1:  return "Feb"
    case 2:  return "Mar"
    case 3:  return "Apr"
    case 4:  return "May"
    case 5:  return "Jun"
    case 6:  return "Jul"
    case 7:  return "Aug"
    case 8:  return "Sep"
    case 9:  return "Oct"
    case 10: return "Nov"
    case 11: return "Dec"
  }
  return "???"
}

function dayOfWeekAbbrev(d: number): string {
  switch (d) {
    case 0: return "Sun"
    case 1: return "Mon"
    case 2: return "Tue"
    case 3: return "Wed"
    case 4: return "Thu"
    case 5: return "Fri"
    case 6: return "Sat"
    case 7: return "Sun"
  }
  return "??"
}
