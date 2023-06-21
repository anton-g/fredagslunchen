import type { MetaFunction } from "@remix-run/node"
import { Link } from "@remix-run/react"
import styled from "styled-components"
import { UnboxingIllustration } from "~/illustrations/Unboxing"

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
        <Brand>Fredagslunchen</Brand> was born way back in 2015 when a former team of mine tried to solve the
        issue of deciding where to eat their Friday lunch. One diligent team member created a way too advanced
        Excel file and suddenly a few years had passed and said Excel file had grown to hundreds of lunches,
        but as time went on the team disbanded it fell through the cracks of time.
      </p>
      <p>
        Fast forward some more years and I'm working with one of my old colleagues which reminds me of our
        lunches. One thing lead to another and now I'm working on Fredagslunchen as a pet project of mine.
      </p>
      <p>
        It's still in early development so you might find bugs, missing features or other inconsistencies. I'm
        slowly tooling away and unpack new features continously so if you are interested you can find{" "}
        <Link to="/changelog">the changelog here</Link>.
      </p>
      <p>
        If you have any feedback, bug reports or just want to say hi you can{" "}
        <a href="https://twitter.com/awnton">reach me on Twitter!</a> :)
      </p>
      <IllustrationWrapper>
        <UnboxingIllustration />
      </IllustrationWrapper>
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

const IllustrationWrapper = styled.div`
  max-width: 600px;
  margin: 80px auto 0;

  svg {
    width: 100%;
  }
`

const Brand = styled.span`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.secondary};
  padding: 0 4px;
`
