import { Form, Link, Outlet } from "@remix-run/react";
import styled from "styled-components";

import { useOptionalUser } from "~/utils";

export default function Index() {
  const user = useOptionalUser();

  return (
    <Wrapper>
      <Header>
        <h1>
          <Link to={"/"}>fredagslunchen</Link>
        </h1>
        <NavBar>
          {user ? (
            <>
              <Link to={"/groups"}>groups</Link> -{" "}
              <StyledForm action="/logout" method="post">
                <LinkButton type="submit">logout</LinkButton>
              </StyledForm>
            </>
          ) : (
            <>
              <Link to={"/join"}>register</Link> -{" "}
              <Link to={"/login"}>login</Link>
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

const NavBar = styled.nav``;

const StyledForm = styled(Form)`
  display: inline;
`;

const LinkButton = styled.button`
  background: none;
  border: 0;
  padding: 0;
  font-family: times, sans-serif;
  text-decoration: underline;
  cursor: pointer;
  font-size: 16px;
`;

const Content = styled.main`
  margin-top: 24px;
`;
