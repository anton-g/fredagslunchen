import { Link } from "@remix-run/react";
import styled from "styled-components";

import { useOptionalUser } from "~/utils";

export default function Index() {
  const user = useOptionalUser();
  return (
    <main>
      <h1>fredagslunchen</h1>
      {user ? (
        <div>{user.email}</div>
      ) : (
        <div>
          <Link to={"/join"}>register</Link> <Link to={"/login"}>login</Link>
        </div>
      )}
    </main>
  );
}
