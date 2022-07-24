import { RemixBrowser } from "@remix-run/react";
import { hydrate } from "react-dom";
import {load} from 'fathom-client'

function hydrateWrapper() {
  hydrate(
    <RemixBrowser />,
    document
  )

  if (ENV.NODE_ENV !== 'development') {
    load('LJDPSTZM', {
      spa: 'history',
      excludedDomains: ['localhost'],
    })
  }
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (window.requestIdleCallback) {
  window.requestIdleCallback(hydrateWrapper)
} else {
  window.setTimeout(hydrate, 1)
}