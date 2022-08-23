import type { MetaFunction } from "@remix-run/node"
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
        bugs, missing features or other inconsistencies but all the "main"
        features should work!
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

const Subtitle = styled.h3`
  font-size: 36px;
  margin: 0;
  margin-bottom: 16px;
`
