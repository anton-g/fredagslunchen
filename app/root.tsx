import type { LinksFunction, LoaderArgs, MetaFunction } from "@remix-run/node"
import mapboxgl from "mapbox-gl"
import { json } from "@remix-run/node"
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLoaderData,
  useLocation,
} from "@remix-run/react"
import GlobalStyle from "./styles/global"

import { getUser } from "./session.server"
import { ThemeProvider } from "styled-components"
import { theme } from "./styles/theme"
import { getEnv } from "./env.server"
import { useEffect, useRef } from "react"
import { getDomainUrl, removeTrailingSlash } from "./utils"

declare global {
  interface Window {
    fathom:
      | {
          trackPageview(): void
        }
      | undefined
  }
}

type FathomQueue = Array<{ command: "trackPageview" }>

function CanonicalLink({
  origin,
  fathomQueue,
}: {
  origin: string
  fathomQueue: React.MutableRefObject<FathomQueue>
}) {
  const { pathname } = useLocation()
  const canonicalUrl = removeTrailingSlash(`${origin}${pathname}`)

  useEffect(() => {
    if (window.fathom) {
      window.fathom.trackPageview()
    } else {
      // Fathom hasn't finished loading yet! queue the command
      fathomQueue.current.push({ command: "trackPageview" })
    }
    // Fathom looks uses the canonical URL to track visits, so we're using it
    // as a dependency even though we're not using it explicitly
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canonicalUrl])

  return <link rel="canonical" href={canonicalUrl} />
}

export const links: LinksFunction = () => {
  return [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    // { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: true },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700&display=swap",
    },
    {
      rel: "stylesheet",
      href: "https://api.tiles.mapbox.com/mapbox-gl-js/v2.9.2/mapbox-gl.css",
    },
  ]
}

// TODO check if we can switch to maplibre to avoid access tokens from MapBox
if (ENV.MAPBOX_ACCESS_TOKEN) {
  mapboxgl.accessToken = ENV.MAPBOX_ACCESS_TOKEN
}

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Fredagslunchen",
  viewport: "width=device-width,initial-scale=1",
})

export const loader = async ({ request }: LoaderArgs) => {
  return json({
    user: await getUser(request),
    ENV: getEnv(),
    requestInfo: {
      origin: getDomainUrl(request),
    },
  })
}

export default function App() {
  const data = useLoaderData<typeof loader>()

  const fathomQueue = useRef<FathomQueue>([])

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
        <CanonicalLink
          origin={data.requestInfo.origin}
          fathomQueue={fathomQueue}
        />
        {typeof document === "undefined" ? "__STYLES__" : null}
      </head>
      <body>
        <ThemeProvider theme={theme}>
          <Outlet />
          <GlobalStyle />
        </ThemeProvider>
        <ScrollRestoration />
        {ENV.NODE_ENV === "development" ? null : (
          <script
            src="https://cdn.usefathom.com/script.js"
            data-site={ENV.FATHOM_SITE_ID}
            data-spa="history"
            data-auto="false" // prevent tracking visit twice on initial page load
            data-excluded-domains="localhost"
            defer
            onLoad={() => {
              fathomQueue.current.forEach(({ command }) => {
                if (window.fathom) {
                  window.fathom[command]()
                } else {
                  // Fathom isn't available even though the script has loaded
                  // this should never happen!
                }
              })
              fathomQueue.current = []
            }}
          />
        )}
        <Scripts />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.ENV)};`,
          }}
        />
        {ENV.NODE_ENV === "development" ? <LiveReload /> : null}
      </body>
    </html>
  )
}

export function ErrorBoundary() {
  return (
    <div>
      <h1>Uh oh!</h1>
      <p> Something went wrong!</p>
      <p>
        Try again later or{" "}
        <a rel="nofollow" href="https://twitter.com/awnton">
          let me know!
        </a>
      </p>
    </div>
  )
}
