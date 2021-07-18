// @flow

// Flow typechecking will fail if a call to unreachable
// turns out to be reachable, e.g. because of a
// non-exhaustive switch on a union type.

export function unreachable(label: string, v: empty): Error {
  const message = `unreachable ${label} ${(v: any)}`
  console.error(message)
  return new Error(message)
}
