import type { ActionFunction, LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { formatNumber, getAverageNumber } from "~/utils";
import { json } from "@remix-run/node";
import { Form, useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import type { Group } from "~/models/group.server";
import { deleteGroup } from "~/models/group.server";
import { getGroupDetails } from "~/models/group.server";
import { requireUserId } from "~/session.server";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Table } from "~/components/Table";
import { Spacer } from "~/components/Spacer";
import { Button, LinkButton } from "~/components/Button";
import { Stat } from "~/components/Stat";
import { HoverCard } from "~/components/HoverCard";
import { Map } from "~/components/Map";
import { Card } from "~/components/Card";
import { useOnScreen } from "~/hooks/useOnScreen";
import { useRef, useState } from "react";
import { getEnv } from "~/env.server";
import { Dialog } from "~/components/Dialog";
import { Tooltip } from "~/components/Tooltip";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Input } from "~/components/Input";
import { Stack } from "~/components/Stack";

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireUserId(request);
  invariant(params.groupId, "groupId not found");

  const details = await getGroupDetails({ userId, id: params.groupId });
  if (!details) {
    throw new Response("Not Found", { status: 404 });
  }

  const isAdmin = details.group.members.some(
    (m) => m.userId === userId && m.role === "ADMIN"
  );

  return json({ details, ENV: getEnv(), isAdmin });
};

export const action: ActionFunction = async ({ request, params }) => {
  if (request.method !== "DELETE") return null;

  const userId = await requireUserId(request);
  invariant(params.groupId, "groupId not found");

  await deleteGroup({
    id: params.groupId,
    requestedByUserId: userId,
  });

  return redirect("/groups");
};

export default function GroupDetailsPage() {
  const { details, ENV, isAdmin } = useLoaderData<typeof loader>();

  const orderedPickers = details.group.members
    .slice()
    .sort(
      (a, b) =>
        b.stats.lunchCount / b.stats.choiceCount -
        a.stats.lunchCount / a.stats.choiceCount
    );
  const suggestedPicker = orderedPickers[0];
  const alternativePickers = orderedPickers.slice(1);

  const allLunches = details.group.groupLocations
    .flatMap((loc) => loc.lunches.map((lunch) => ({ loc, ...lunch })))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div>
      <Stats>
        <Stat label="Average score" value={details.stats.averageScore} />
        <Stat
          label="Best location"
          value={`${details.stats.bestLocation.name || "-"}`}
          detail={
            details.stats.bestLocation.name
              ? formatNumber(details.stats.bestLocation.score, 10)
              : undefined
          }
        />
        <Stat
          label="Worst location"
          value={`${details.stats.worstLocation.name || "-"}`}
          detail={
            details.stats.worstLocation.name
              ? formatNumber(details.stats.worstLocation.score, 10)
              : undefined
          }
        />
        <Stat
          label="Most positive"
          value={`${
            details.stats.mostPositive ? details.stats.mostPositive.name : "-"
          }`}
          detail={
            details.stats.mostPositive
              ? formatNumber(details.stats.mostPositive.score)
              : undefined
          }
        />
        <Stat
          label="Most negative"
          value={`${
            details.stats.mostNegative ? details.stats.mostNegative.name : "-"
          }`}
          detail={
            details.stats.mostNegative
              ? formatNumber(details.stats.mostNegative.score)
              : undefined
          }
        />
        <Stat
          label="Most average"
          value={`${
            details.stats.mostAvarage ? details.stats.mostAvarage.name : "-"
          }`}
          detail={
            details.stats.mostAvarage
              ? formatNumber(details.stats.mostAvarage.score)
              : undefined
          }
        />
      </Stats>
      <Spacer size={48} />
      <SectionHeader>
        <Subtitle>Members</Subtitle>
        <ActionBar>
          <LinkButton to={`/groups/${details.group.id}/invite`}>
            Invite user
          </LinkButton>
        </ActionBar>
      </SectionHeader>
      <Spacer size={8} />
      <Table>
        <Table.Head>
          <tr>
            <Table.Heading>Name</Table.Heading>
            <Table.Heading numeric>Lunches</Table.Heading>
            <Table.Heading numeric>Avg score</Table.Heading>
            <Table.Heading>Favorite lunch</Table.Heading>
            <Table.Heading>Worst lunch</Table.Heading>
          </tr>
        </Table.Head>
        <tbody>
          {details.group.members.map((member) => (
            <tr key={member.userId}>
              <Table.Cell>
                <Link to={`/users/${member.userId}`}>{member.user.name}</Link>
              </Table.Cell>
              <Table.Cell numeric>{member.stats.lunchCount}</Table.Cell>
              <Table.Cell numeric>
                {formatNumber(member.stats.averageScore)}
              </Table.Cell>
              <Table.Cell>{member.stats.highestScore}</Table.Cell>
              <Table.Cell>{member.stats.lowestScore}</Table.Cell>
            </tr>
          ))}
        </tbody>
      </Table>
      <Spacer size={48} />
      <Subtitle>Suggestions</Subtitle>
      <Spacer size={8} />
      <Stats>
        <HoverCard>
          <HoverCard.Trigger>
            <Stat label="Location picker" value={suggestedPicker.user.name} />
          </HoverCard.Trigger>
          {alternativePickers.length > 0 && (
            <HoverCard.Content align="start" alignOffset={16}>
              <h4 style={{ margin: 0 }}>Alternatives</h4>
              <Spacer size={8} />
              <PickerAlternativesList start={2}>
                {alternativePickers.map((member) => (
                  <li key={member.userId}>{member.user.name}</li>
                ))}
              </PickerAlternativesList>
            </HoverCard.Content>
          )}
        </HoverCard>
      </Stats>
      <Spacer size={48} />
      <SectionHeader>
        <Subtitle>Lunches</Subtitle>
        <ActionBar>
          <LinkButton to={`/groups/${details.group.id}/lunches/new`}>
            New lunch
          </LinkButton>
          <LinkButton to={`/groups/${details.group.id}/locations/new`}>
            New location
          </LinkButton>
        </ActionBar>
      </SectionHeader>
      <Spacer size={8} />
      <Table>
        <Table.Head>
          <tr>
            <Table.Heading>Date</Table.Heading>
            <Table.Heading>Location</Table.Heading>
            <Table.Heading>Choosen by</Table.Heading>
            <Table.Heading numeric>Avg score</Table.Heading>
          </tr>
        </Table.Head>
        <tbody>
          {allLunches.map((lunch) => (
            <tr key={lunch.id}>
              <Table.Cell>
                <Link to={`/groups/${details.group.id}/lunches/${lunch.id}`}>
                  {new Date(lunch.date).toLocaleDateString()}
                </Link>
              </Table.Cell>
              <Table.Cell>
                <Link
                  to={`/groups/${details.group.id}/locations/${lunch.loc.locationId}`}
                >
                  {lunch.loc.location.name}
                </Link>
              </Table.Cell>
              <Table.Cell>
                <Link to={`/users/${lunch.choosenBy.id}`}>
                  {lunch.choosenBy.name}
                </Link>
              </Table.Cell>
              <Table.Cell numeric>
                {formatNumber(getAverageNumber(lunch.scores, "score"))}
              </Table.Cell>
            </tr>
          ))}
        </tbody>
      </Table>
      <Spacer size={48} />
      {ENV.ENABLE_MAPS && (
        <>
          <Subtitle>Map</Subtitle>
          <Spacer size={8} />
          <LazyCard>
            <Map
              locations={details.group.groupLocations
                .filter((x) => x.lunches.length > 0)
                .map((x) => ({
                  address: x.location.address,
                  averageScore: getAverageNumber(
                    x.lunches.flatMap((y) => y.scores),
                    "score"
                  ),
                  highestScore: 0,
                  id: x.locationId,
                  lat: x.location.lat,
                  lon: x.location.lon,
                  lowestScore: 0,
                  lunchCount: x.lunches.length,
                  name: x.location.name,
                }))}
            />
          </LazyCard>
        </>
      )}
      {isAdmin && (
        <>
          <Spacer size={64} />
          <AdminActions groupName={details.group.name} />
        </>
      )}
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Group not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}

const ActionBar = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 16px;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(auto, 175px));
  gap: 24px;
  width: 100%;
`;

const Subtitle = styled.h3`
  margin: 0;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
`;

const PickerAlternativesList = styled.ol`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style-position: inside;

  > li {
    font-size: 16px;
  }
`;

const LazyCard: React.FC = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null!);
  const isOnScreen = useOnScreen(ref);

  return <MapCard ref={ref}>{isOnScreen && children}</MapCard>;
};

const MapCard = styled(Card)`
  padding: 0;
  min-height: 400px;
`;

const AdminActions = ({ groupName }: { groupName: Group["name"] }) => {
  const [confirmNameValue, setConfirmNameValue] = useState("");

  return (
    <Wrapper axis="horizontal" gap={16}>
      <Dialog>
        <Tooltip>
          <Tooltip.Trigger asChild>
            <Dialog.Trigger asChild>
              <Button variant="round" aria-label="Delete group">
                <Cross2Icon />
              </Button>
            </Dialog.Trigger>
          </Tooltip.Trigger>
          <Tooltip.Content>Delete group</Tooltip.Content>
        </Tooltip>
        <Dialog.Content>
          <Dialog.Close />
          <Dialog.Title>
            Are you sure you want to delete the group {groupName}?
          </Dialog.Title>
          <DialogDescription>
            This will delete this group including all locations, lunches and
            scores. This action is <strong>irreversible</strong> and{" "}
            <strong>cannot be undone.</strong>
          </DialogDescription>
          <label htmlFor="name">
            Please type <strong>{groupName}</strong> to confirm.
          </label>
          <Input
            id="name"
            required
            name="name"
            onChange={(e) => setConfirmNameValue(e.target.value)}
          />
          <Spacer size={16} />
          <Form method="delete">
            <Button
              variant="large"
              style={{ marginLeft: "auto" }}
              disabled={confirmNameValue !== groupName}
            >
              I am sure
            </Button>
          </Form>
        </Dialog.Content>
      </Dialog>
    </Wrapper>
  );
};

const Wrapper = styled(Stack)`
  justify-content: center;
`;

const DialogDescription = styled(Dialog.Description)`
  > p {
    margin: 0;
    margin-bottom: 16px;
  }
`;
