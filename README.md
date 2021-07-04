# Path OS

Path is an "operating system frontend" that runs in webkit
browsers like Chrome and Safari. Its goal is to provide a
desktop computing experience that can be _completely
customized_ (visually and functionally) without modifying
the host OS (e.g. macOS or Linux).

This repository houses the collection of components that
make up Path OS.

## Components

- A browser extension, which lives in `extension/`.
- A browser-based UI, which lives in `client/`.
- A server which interacts with the host OS on behalf of the
  client, and lives in `server/`.

## Installation

- Install Google Chrome
- Clone this repository
- Enable Chrome's developer mode
- Load the extension in `extension/` as an unpacked extension
- Run `server/bin/run` to start the server
- Navigate to http://localhost:1234 in Chrome
- For best results, fullscreen the browser window.

Double-click anywhere or hit ctrl+shift+N to open a new
PathOS window.

## Writing Apps

An "app" in Path OS is just an HTML page. When an app starts
up, an iframe pointing to the HTML page gets created.

The app can then use PathOS APIs via `window.postMessage()`,
which allow it to do things like read and write files and
run programs on the host computer. For details, see the
`docs/` directory.
