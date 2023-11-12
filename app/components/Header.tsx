import { Form, Link } from "@remix-run/react"
import styled from "styled-components"
import { useOptionalUser } from "~/utils"
import { NavLink } from "./Button"
import { useThemeContext } from "~/styles/theme"

export const Header = ({ isAdmin }: { isAdmin: boolean }) => {
  const user = useOptionalUser()
  const { setTheme } = useThemeContext()

  return (
    <Wrapper>
      <Logo>
        <Link to={"/"}>fredagslunchen</Link>
      </Logo>
      <NavBar>
        {user ? (
          <>
            <NavLink to={`/users/${user.id}`}>you</NavLink>
            <NavLink to={"/groups"}>clubs</NavLink>
            {isAdmin && <NavLink to={"/admin"}>admin</NavLink>}
            {/* <NavLink to={"/discover"}>discover</NavLink> */}
            <StyledForm action="/logout" method="post" onClick={() => setTheme("light")}>
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
    </Wrapper>
  )
}

const Wrapper = styled.header`
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
