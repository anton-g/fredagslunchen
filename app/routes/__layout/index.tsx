import styled from "styled-components";
import { useOptionalUser } from "~/utils";

export default function Index() {
  const user = useOptionalUser();

  if (!user) return null;

  return (
    <Wrapper>
      <Title>:)</Title>
    </Wrapper>
  );
}

const Wrapper = styled.div``;

const Title = styled.h2`
  font-size: 48px;
  margin: 0;
`;
