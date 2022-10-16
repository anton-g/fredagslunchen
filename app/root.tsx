import { useEffect, useRef } from "react"
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
  useLoaderData,
  useLocation,
} from "@remix-run/react"
import GlobalStyle from "./styles/global"
import { getUser } from "./session.server"
import { ThemeProvider } from "styled-components"
import { getEnv } from "./env.server"
import { getDomainUrl, removeTrailingSlash } from "./utils"
import {
  availableThemes,
  InternalThemeProvider,
  useThemeContext,
} from "./styles/theme"
import { FeatureFlagProvider } from "./FeatureFlagContext"

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
    {
      rel: "apple-touch-icon",
      href: "logo.png",
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
  "twitter:title": "Fredagslunchen",
  "twitter:card": "summary_large_image",
  "twitter:description": "Never worry about where to eat again.",
  "og:title": "Fredagslunchen",
  "og:description": "Never worry about where to eat again.",
  "og:image":
    "https://res.cloudinary.com/anton-g/image/upload/c_fill,w_1280,h_699/l_text:Roboto_140_bold:Fredagslunchen/template_ns4drh.png",
})

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getUser(request)
  return json({
    user,
    ENV: getEnv(),
    requestInfo: {
      origin: getDomainUrl(request),
    },
    theme: user?.theme || "light",
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
        <FeatureFlagProvider
          defaultValue={{ premium: data.ENV.ENABLE_PREMIUM }}
        >
          <InternalThemeProvider defaultTheme={data.theme}>
            <Content />
          </InternalThemeProvider>
        </FeatureFlagProvider>
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

const Content = () => {
  const { theme } = useThemeContext()

  return (
    <ThemeProvider theme={availableThemes[theme]}>
      <Outlet />
      <GlobalStyle />
    </ThemeProvider>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
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
