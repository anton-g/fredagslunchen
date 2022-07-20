import type { LinksFunction, LoaderArgs, MetaFunction } from "@remix-run/node";
import mapboxgl from "mapbox-gl";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import GlobalStyle from "./styles/global";

import { getUser } from "./session.server";
import { ThemeProvider } from "styled-components";
import { theme } from "./styles/theme";

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
  ];
};

// TODO check if we can switch to maplibre to avoid access tokens from MapBox
mapboxgl.accessToken =
  "pk.eyJ1IjoiYW50b24tZyIsImEiOiJjbDV0aDZiOG0wZXF3M2RzZHB0MXBteGZ6In0.ARgAT6GpakcgZbRsO1dA6Q";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Fredagslunchen",
  viewport: "width=device-width,initial-scale=1",
});

export const loader = async ({ request }: LoaderArgs) => {
  return json({
    user: await getUser(request),
  });
};

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
        {typeof document === "undefined" ? "__STYLES__" : null}
      </head>
      <body>
        <ThemeProvider theme={theme}>
          <Outlet />
          <GlobalStyle />
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
