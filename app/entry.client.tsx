import { RemixBrowser } from "@remix-run/react";
import { hydrate } from "react-dom";
import { load } from "fathom-client";

function hydrateWrapper() {
  hydrate(<RemixBrowser />, document);

  if (ENV.NODE_ENV !== "development" && ENV.FATHOM_SITE_ID) {
    load(ENV.FATHOM_SITE_ID, {
      spa: "history",
      excludedDomains: ["localhost"],
    });
  }
}

if (window.requestIdleCallback) {
  window.requestIdleCallback(hydrateWrapper);
} else {
  window.setTimeout(hydrateWrapper, 1);
}
