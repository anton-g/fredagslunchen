import type { ReactNode } from "react"
import * as E from "@react-email/components"

export default function Default() {}

export function EmailRoot({ children, title }: { children: ReactNode; title: string }) {
  return (
    <E.Html
      style={{
        backgroundColor: "#fff",
        fontFamily:
          "Inter, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif",
      }}
    >
      <E.Head>
        <title>{title}</title>
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light only"></meta>
        <EmailStyle />
      </E.Head>
      <E.Container
        className="root"
        style={{
          backgroundColor: "#fff",
          background: "#fff",
          height: "100%",
          marginTop: "48px",
          marginBottom: "128px",
        }}
      >
        {children}
      </E.Container>
    </E.Html>
  )
}

export function EmailStyle() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `body, html {
  background-color: #fff;
  color: #000;
}
.button {
  background: #fff;
  color: #000 !important;
  border: 2px solid #000;
  border-radius: 4px;
  position: relative;
  transform: translate(0.15rem, -0.15em);
  transform-style: preserve-3d;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  width: fit-content;
  font-size: 18px;
  transition: transform 75ms ease-in-out;
  height: fit-content;
}
.button::before {
content: "";
box-sizing: border-box;
position: absolute;
inset: -2px;
width: calc(100% + 4px);
height: calc(100% + 4px);
background-color: #000;
transform: translate3d(-0.15rem, 0.15rem, -1em);
border: inherit;
border-radius: inherit;
transition: inherit;
}
@media (prefers-color-scheme: dark) {
  html, body, .root {
    background-color: #FFFFFF !important;
  }
}`,
      }}
    />
  )
}

export function EmailLogo() {
  return (
    <E.Row>
      <E.Column>
        <div
          style={{
            color: "#ffffff",
            backgroundColor: "#000000",
            padding: "8px 16px 8px",
            fontSize: "32px",
            fontWeight: "bold",
          }}
        >
          fredagslunchen
        </div>
      </E.Column>
      <E.Column>
        <E.Img
          style={{ height: 54.5 }}
          src={
            "data:image/png;base64,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"
          }
        />
      </E.Column>
    </E.Row>
  )
}
