import { Form, Link, Outlet } from "@remix-run/react";
import styled from "styled-components";

import { useOptionalUser } from "~/utils";

export default function Index() {
  const user = useOptionalUser();

  if (!user) return null;

  return <Wrapper>hello {user.name}</Wrapper>;
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
