import type {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
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

export const links: LinksFunction = () => {
  return [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    // { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: true },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700&display=swap",
    },
  ];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Fredagslunchen",
  viewport: "width=device-width,initial-scale=1",
});

type LoaderData = {
  user: Awaited<ReturnType<typeof getUser>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  return json<LoaderData>({
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
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
        <GlobalStyle />
      </body>
    </html>
  );
}
