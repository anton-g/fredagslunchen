import { RemixBrowser } from "@remix-run/react"
import { hydrate } from "react-dom"

function hydrateWrapper() {
  hydrate(<RemixBrowser />, document)
}

if (window.requestIdleCallback) {
  window.requestIdleCallback(hydrateWrapper)
} else {
  window.setTimeout(hydrateWrapper, 1)
}
