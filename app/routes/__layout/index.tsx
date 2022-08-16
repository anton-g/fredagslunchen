import { json } from "@remix-run/node";
import type { LoaderArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import styled from "styled-components";
import { LinkButton } from "~/components/Button";
import { Spacer } from "~/components/Spacer";
import { getUserId } from "~/session.server";
import { getFullUserById } from "~/models/user.server";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request);

  const user = userId
    ? await getFullUserById({ id: userId, requestUserId: userId })
    : null;

  return json({
    user,
  });
};

export default function Index() {
  const { user } = useLoaderData<typeof loader>();

  if (!user) {
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

  if (user.groups.length > 0) return null;

  return (
    <Wrapper>
      <Title>Welcome {user.name}!</Title>
      <Spacer size={16} />
      <p>
        <Link to="/groups/new">Create a new group</Link> to get started! You can
        create a group for whatever constellation of people you want. How about
        your team at work, that group of friends you always meet with over a
        bowl of ramen, or maybe a group just for you?
      </p>
      <Spacer size={24} />
      <LinkButton to="/groups/new" variant="large">
        Create your first group
      </LinkButton>
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

    a {
      text-decoration: underline;
    }
  }
`;

const Title = styled.h2`
  font-size: 24px;
  margin: 0;
`;
