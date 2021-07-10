// @flow

import {useModel} from "./useModel.js"

function noop() {}

export function useRedraw(): () => void {
  const [_, withRedraw] = useModel(noop)
  return withRedraw(noop);
}
