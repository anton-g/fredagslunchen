import styled from "styled-components";
import { Spacer } from "~/components/Spacer";
import { useOptionalUser } from "~/utils";

export default function Index() {
  const user = useOptionalUser();

  if (user) return null;

  return (
    <Wrapper>
      <Title>Welcome.</Title>
      <Spacer size={16} />
      <p>
        Get together with your friends or colleagues for a bit of food. Discuss
        where to eat. Discover new restaurants. Have a lovely time. Rate your
        lunch. Soak in the statistics. And then do it all again.
      </p>
      <Spacer size={8} />
      <p style={{ fontWeight: "bold" }}>Enjoy Fredagslunchen.</p>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 450px;
  margin: 0 auto;

  > p {
    text-align: center;
    margin: 0;
  }
`;

const Title = styled.h2`
  font-size: 24px;
  margin: 0;
`;
