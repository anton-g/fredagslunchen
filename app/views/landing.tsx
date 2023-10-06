import { Link } from "@remix-run/react"
import styled from "styled-components"
import { LinkButton } from "~/components/Button"
import { Header } from "~/components/Header"
import { Spacer } from "~/components/Spacer"
import { ThreePeopleVibing } from "~/illustrations/ThreePeopleVibing"

export function Landing() {
  return (
    <Wrapper>
      <Header isAdmin={false}></Header>
      <Spacer size={48} />
      <Content>
        <Title style={{ textAlign: "center" }}>Hey you.</Title>
        <p>
          <strong>Tired of discussions about where to eat?</strong> You've found the right place. Get together
          with your friends, colleagues or family, have a lovely time, rate your lunch, soak in the
          statistics. And then do it all again.
        </p>
        <Spacer size={36} />
        <LinkButton to="/join" size="huge" variant="inverted">
          Join the club
        </LinkButton>
        <Spacer size={16} />
        <Link to="/groups/demo" style={{ textDecoration: "underline" }}>
          Show me an example
        </Link>
      </Content>
      <Footer>
        <ThreePeopleVibing />
      </Footer>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100%;
`

const Content = styled.main`
  display: flex;
  flex-direction: column;
  max-width: 65ch;
  width: 95vw;
  margin: 0 auto;
  align-items: center;

  > p {
    text-align: center;
    margin: 0;
    font-size: 18px;

    a {
      text-decoration: underline;
    }
  }
`

const Title = styled.h2`
  font-size: 32px;
  margin: 0;
  margin-bottom: 16px;
`

const Footer = styled.div`
  margin-top: auto;
  max-width: 1000px;
  width: 95vw;

  svg {
    width: 100%;
  }
`
