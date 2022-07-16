import { Form, Link, Outlet } from "@remix-run/react";
import styled from "styled-components";

import { useOptionalUser } from "~/utils";

export default function Index() {
  const user = useOptionalUser();

  return (
    <Wrapper>
      <Header>
        <Logo>
          <Link to={"/"}>fredagslunchen</Link>
        </Logo>
        <NavBar>
          {user ? (
            <>
              <StyledLink to={"/groups"}>groups</StyledLink>
              <StyledLink to={`/users/${user.id}`}>you</StyledLink>
              <StyledForm action="/logout" method="post">
                <LinkButton type="submit">logout</LinkButton>
              </StyledForm>
            </>
          ) : (
            <>
              <StyledLink to={"/join"}>register</StyledLink>
              <StyledLink to={"/login"}>login</StyledLink>
            </>
          )}
        </NavBar>
      </Header>
      <Content>
        <Outlet />
      </Content>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Header = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Logo = styled.h1`
  margin-bottom: 28px;

  a {
    color: ${({ theme }) => theme.colors.secondary};
    background-color: ${({ theme }) => theme.colors.primary};
    padding: 8px 48px;
    text-decoration: none;
  }
`;

const NavBar = styled.nav`
  display: flex;
  gap: 16px;
`;

const StyledForm = styled(Form)`
  position: absolute;
  right: 24px;
  top: 16px;
`;

const LinkButton = styled.button`
  background: none;
  border: 0;
  padding: 0;
  text-decoration: underline;
  cursor: pointer;
  font-size: 16px;
`;

const Content = styled.main`
  margin-top: 48px;
`;

const StyledLink = styled(Link)`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.secondary};
  padding: 2px 4px;

  transform: rotateZ(2deg);

  &:nth-child(even) {
    transform: rotateZ(-2deg);
  }
`;
