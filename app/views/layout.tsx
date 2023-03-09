import type { ReactNode } from "react"
import { Link } from "@remix-run/react"
import styled from "styled-components"
import { Header } from "~/components/Header"

export const Layout = ({ isAdmin, children }: { isAdmin: boolean; children: ReactNode }) => {
  return (
    <Wrapper>
      <Header isAdmin={isAdmin} />
      <Content>{children}</Content>
      <Footer>
        <Link to="/about">about</Link>
      </Footer>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 24px;
  min-height: 100%;
`

const Content = styled.main`
  margin-top: 48px;
  max-width: 800px;
  width: 100%;
  margin-bottom: 108px;
  padding: 0 16px;
`

const Footer = styled.footer`
  margin-top: auto;
  margin-bottom: 16px;
  > a {
    text-decoration: underline;
  }
`
