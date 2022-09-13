import type { MetaFunction } from "@remix-run/node"
import { Link } from "@remix-run/react"
import styled from "styled-components"

export const meta: MetaFunction = () => {
  return {
    title: "About Fredagslunchen",
  }
}

export default function AboutPage() {
  return (
    <Wrapper>
      <Title>About</Title>
      <p>
        Fredagslunchen.club is still in early development so you might find
        bugs, missing features or other inconsistencies. If you are interested
        you can find <Link to="/changelog">the changelog here</Link>.
      </p>
      <p>
        If you have any feedback, bug reports or just want to say hi you can{" "}
        <a href="https://twitter.com/awnton">reach me on Twitter!</a> :)
      </p>
    </Wrapper>
  )
}

const Wrapper = styled.main`
  a {
    text-decoration: underline;
  }
`

const Title = styled.h2`
  font-size: 48px;
  margin: 0;
  margin-bottom: 24px;
`
