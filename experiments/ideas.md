## Navigation

- to display the preview URL when the user hovers over a link...
  register a document.body.onmousemove handler in the iframe.
  The target of mousemove is the innermost node the cursor is over.
  if you find a link by searching up the tree from there,
  send the href to the parent window.
- to get the destination url when the user actually navigates,
  register an onclick handler on body that sends the href of
  document.activeElement to the parent window. This also works
  for keyboard navigation! Note that the navigation may be
  canceled after the user clicks, so don't update the URL bar
  until beforeunload is fired.

type NavRelatedEvent =
  | {|type: "hover-link", destination: string|}
  | {|type: "begin-navigation", destination: string|}
  | {|type: "beforeunload"|}

- re-render the URL bar before unload and after the new
  page loads. This should handle redirects correctly.
- there isn't a way to detect when loading an iframe fails,
  e.g. due to the host not being reachable. I think we just
  have to implement timeouts in wetware.
