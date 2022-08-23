import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Form, Link, Outlet, useLoaderData } from "@remix-run/react"
import styled from "styled-components"
import { NavLink } from "~/components/Button"
import { checkIsAdmin } from "~/models/user.server"
import { getUserId } from "~/session.server"

import { useOptionalUser } from "~/utils"

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request)

  const isAdmin = userId ? await checkIsAdmin(userId) : false

  return json({ isAdmin })
}

export default function Index() {
  const { isAdmin } = useLoaderData<typeof loader>()
  const user = useOptionalUser()

  return (
    <Wrapper>
      <Header>
        <Logo>
          <Link to={"/"}>fredagslunchen</Link>
        </Logo>
        <NavBar>
          {user ? (
            <>
              <NavLink to={`/users/${user.id}`}>you</NavLink>
              <NavLink to={"/groups"}>groups</NavLink>
              {isAdmin && <NavLink to={"/admin"}>admin</NavLink>}
              {/* <NavLink to={"/discover"}>discover</NavLink> */}
              <StyledForm action="/logout" method="post">
                {/* TODO logout on mobile*/}
                <LinkButton type="submit">logout</LinkButton>
              </StyledForm>
            </>
          ) : (
            <>
              <NavLink to={"/join"}>join</NavLink>
              <NavLink to={"/login"}>login</NavLink>
            </>
          )}
        </NavBar>
      </Header>
      <Content>
        <Outlet />
      </Content>
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

const Header = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Logo = styled.h1`
  margin-bottom: 28px;

  a {
    color: ${({ theme }) => theme.colors.secondary};
    background-color: ${({ theme }) => theme.colors.primary};
    padding: 8px 48px;
    text-decoration: none;
  }
`

const NavBar = styled.nav`
  display: flex;
  gap: 16px;
`

const StyledForm = styled(Form)`
  position: absolute;
  right: 24px;
  top: 16px;
`

const LinkButton = styled.button`
  background: none;
  border: 0;
  padding: 0;
  text-decoration: underline;
  cursor: pointer;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.primary};
`

const Content = styled.main`
  margin-top: 48px;
  max-width: 670px;
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
