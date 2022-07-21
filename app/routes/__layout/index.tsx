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
        No more discussions about where to eat. Just get together with your
        friends or colleagues, discover new restaurants, have a lovely time,
        rate your lunch, soak in the statistics. And then do it all again.
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
