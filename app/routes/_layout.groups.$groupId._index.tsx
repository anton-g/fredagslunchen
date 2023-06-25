import type { LoaderArgs } from "@remix-run/node"
import type { RecursivelyConvertDatesToStrings } from "~/utils"
import { formatNumber, formatTimeAgo, getAverageNumber } from "~/utils"
import { json } from "@remix-run/node"
import { isRouteErrorResponse, useFetcher, useLoaderData, useRouteError } from "@remix-run/react"
import invariant from "tiny-invariant"
import type { Group, GroupPermissions } from "~/models/group.server"
import { getGroupPermissions } from "~/models/group.server"
import { getGroupDetails } from "~/models/group.server"
import { getUserId } from "~/session.server"
import { Link } from "react-router-dom"
import styled from "styled-components"
import { Spacer } from "~/components/Spacer"
import { Button, LinkButton, UnstyledButton } from "~/components/Button"
import { Stat } from "~/components/Stat"
import { Map } from "~/components/Map"
import { Card } from "~/components/Card"
import { useOnScreen } from "~/hooks/useOnScreen"
import type { ReactNode } from "react"
import { useRef } from "react"
import { Tooltip } from "~/components/Tooltip"
import { ExitIcon, GearIcon } from "@radix-ui/react-icons"
import { Stack } from "~/components/Stack"
import { StatsGrid } from "~/components/StatsGrid"
import { Dialog } from "~/components/Dialog"
import { useFeatureFlags } from "~/FeatureFlagContext"
import { Popover } from "~/components/Popover"
import { CreateAnonymousUserButton } from "~/components/CreateAnonymousUserButton"
import { SortableTable } from "~/components/SortableTable"

export const loader = async ({ request, params }: LoaderArgs) => {
  let userId = await getUserId(request)
  invariant(params.groupId, "groupId not found")

  const details = await getGroupDetails({ id: params.groupId })
  if (!details) {
    throw new Response("Not Found", { status: 404 })
  }

  const permissions = await getGroupPermissions({
    currentUserId: userId,
    group: details.group,
  })

  return json({
    details,
    permissions,
  })
}

export default function GroupDetailsPage() {
  const { maps } = useFeatureFlags()
  const { details, permissions } = useLoaderData<typeof loader>()

  const orderedPickers = details.group.members
    .filter((x) => !x.inactive)
    .slice()
    .sort((a, b) => {
      if (a.stats.lunchCount === 0) return 1
      if (b.stats.lunchCount === 0) return -1

      return a.stats.choiceCount / a.stats.lunchCount - b.stats.choiceCount / b.stats.lunchCount
    })
  const suggestedPicker = orderedPickers[0]
  const alternativePickers = orderedPickers.slice(1)

  const allLunches = details.group.groupLocations
    .flatMap((loc) => loc.lunches.map((lunch) => ({ loc, ...lunch })))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div>
      <StatsGrid>
        <Stat label="Average rating" value={details.stats.averageScore} />
        <Stat
          label="Best lunch"
          value={`${details.stats.bestLunch.name || "-"}`}
          detail={details.stats.bestLunch.name ? formatNumber(details.stats.bestLunch.score, 10) : undefined}
          to={details.stats.bestLunch ? `lunches/${details.stats.bestLunch.id}` : undefined}
        />
        <Stat
          label="Worst lunch"
          value={`${details.stats.worstLunch.name || "-"}`}
          detail={
            details.stats.worstLunch.name ? formatNumber(details.stats.worstLunch.score, 10) : undefined
          }
          to={details.stats.worstLunch ? `lunches/${details.stats.worstLunch.id}` : undefined}
        />
        <Stat
          label="Most positive"
          value={`${details.stats.mostPositive ? details.stats.mostPositive.name : "-"}`}
          detail={details.stats.mostPositive ? formatNumber(details.stats.mostPositive.score) : undefined}
          to={details.stats.mostPositive ? `/users/${details.stats.mostPositive.id}` : undefined}
        />
        <Stat
          label="Most negative"
          value={`${details.stats.mostNegative ? details.stats.mostNegative.name : "-"}`}
          detail={details.stats.mostNegative ? formatNumber(details.stats.mostNegative.score) : undefined}
          to={details.stats.mostNegative ? `/users/${details.stats.mostNegative.id}` : undefined}
        />
        <Stat
          label="Most average"
          value={`${details.stats.mostAvarage ? details.stats.mostAvarage.name : "-"}`}
          detail={details.stats.mostAvarage ? formatNumber(details.stats.mostAvarage.score) : undefined}
          to={details.stats.mostAvarage ? `/users/${details.stats.mostAvarage.id}` : undefined}
        />
      </StatsGrid>
      <Spacer size={48} />
      <SectionHeader>
        <Subtitle>Members</Subtitle>
        <ActionBar>
          {permissions.invite && (
            <LinkButton to={`/groups/${details.group.id}/invite`}>Invite members</LinkButton>
          )}
          <CreateAnonymousUserButton groupId={details.group.id} />
        </ActionBar>
      </SectionHeader>
      <Spacer size={8} />
      <SortableTable
        data={details.group.members}
        columns={[
          { label: "Name", key: (row) => row.user.name },
          { label: "Lunches", key: (row) => row.stats.lunchCount, props: { numeric: true } },
          { label: "Avg rating", key: (row) => row.stats.averageScore, props: { numeric: true } },
          { label: "Favorite lunch", key: (row) => row.stats.highestScore?.name },
          { label: "Worst lunch", key: (row) => row.stats.lowestScore?.name },
        ]}
        defaultSort={{ label: "Name", key: (row) => row.user.name }}
      >
        {(member) => (
          <tr key={member.userId}>
            <SortableTable.Cell>
              <Link to={`/users/${member.userId}`}>{member.user.name}</Link>
            </SortableTable.Cell>
            <SortableTable.Cell numeric>{member.stats.lunchCount}</SortableTable.Cell>
            <SortableTable.Cell numeric>{formatNumber(member.stats.averageScore)}</SortableTable.Cell>
            <SortableTable.Cell>
              {member.stats.highestScore ? (
                <Link to={`/groups/${details.group.id}/lunches/${member.stats.highestScore.id}`}>
                  {member.stats.highestScore.name}
                </Link>
              ) : (
                "-"
              )}
            </SortableTable.Cell>
            <SortableTable.Cell>
              {member.stats.lowestScore ? (
                <Link to={`/groups/${details.group.id}/lunches/${member.stats.lowestScore.id}`}>
                  {member.stats.lowestScore.name}
                </Link>
              ) : (
                "-"
              )}
            </SortableTable.Cell>
          </tr>
        )}
      </SortableTable>
      {permissions.recommendations && (
        <>
          <Spacer size={48} />
          <Subtitle>Recommendations</Subtitle>
          <Spacer size={8} />
          <StatsGrid>
            <Popover>
              <Popover.Trigger asChild>
                <UnstyledButton>
                  <Stat label="Location picker" value={suggestedPicker.user.name} />
                </UnstyledButton>
              </Popover.Trigger>
              {alternativePickers.length > 0 && (
                <Popover.Content align="start" alignOffset={16}>
                  <h4 style={{ margin: 0 }}>Alternatives</h4>
                  <Spacer size={8} />
                  <PickerAlternativesList start={2}>
                    {alternativePickers.map((member) => (
                      <li key={member.userId}>{member.user.name}</li>
                    ))}
                  </PickerAlternativesList>
                </Popover.Content>
              )}
            </Popover>
          </StatsGrid>
        </>
      )}
      <Spacer size={48} />
      <SectionHeader>
        <Subtitle>Lunches</Subtitle>
        {permissions.addLunch && (
          <ActionBar>
            <LinkButton to={`/groups/${details.group.id}/lunches/new`}>New lunch</LinkButton>
          </ActionBar>
        )}
      </SectionHeader>
      <Spacer size={8} />
      <SortableTable
        data={allLunches}
        defaultSort={{ label: "Date", key: (row) => row.date }}
        defaultDirection="desc"
        columns={[
          { label: "Date", key: (row) => row.date },
          { label: "Location", key: (row) => row.loc.location.name },
          { label: "Choosen by", key: (row) => (row.choosenBy ? row.choosenBy.name : "-") },
          {
            label: "Avg rating",
            key: (row) => getAverageNumber(row.scores, "score"),
            props: { numeric: true },
          },
        ]}
      >
        {(lunch) => (
          <SortableTable.LinkRow to={`/groups/${details.group.id}/lunches/${lunch.id}`} key={lunch.id}>
            <SortableTable.Cell>
              <Link to={`/groups/${details.group.id}/lunches/${lunch.id}`}>
                {formatTimeAgo(new Date(lunch.date))}
              </Link>
            </SortableTable.Cell>
            <SortableTable.Cell>{lunch.loc.location.name}</SortableTable.Cell>
            <SortableTable.Cell>{lunch.choosenBy ? lunch.choosenBy.name : "-"}</SortableTable.Cell>
            <SortableTable.Cell numeric>
              {formatNumber(getAverageNumber(lunch.scores, "score"))}
            </SortableTable.Cell>
          </SortableTable.LinkRow>
        )}
      </SortableTable>
      <Spacer size={48} />
      <GroupLocations details={details} showMap={maps} permissions={permissions} />
      <Spacer size={64} />
      <GroupActionBar groupId={details.group.id} groupName={details.group.name} permissions={permissions} />
    </div>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()

  if (error instanceof Error) {
    return <div>An unexpected error occurred: {error.message}</div>
  }

  if (!isRouteErrorResponse(error)) {
    return <h1>Unknown Error</h1>
  }

  if (error.status === 404) {
    return (
      <div>
        <h2>Club not found</h2>
      </div>
    )
  }

  if (error.status === 401) {
    return (
      <div>
        <h2>Access denied</h2>
        If someone sent you this link, ask them to invite you to their club.
      </div>
    )
  }

  return (
    <div>
      <h1>Oops</h1>
      <p>Status: {error.status}</p>
      <p>{error.data.message}</p>
    </div>
  )
}

const ActionBar = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 16px;
`

const Subtitle = styled.h3`
  margin: 0;
`

const SectionHeader = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
`

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
`

const LazyCard = ({ children }: { children: ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null!)
  const isOnScreen = useOnScreen(ref)

  return <MapCard ref={ref}>{isOnScreen && children}</MapCard>
}

const MapCard = styled(Card)`
  padding: 0;
  min-height: 400px;
`

type GroupActionBarProps = {
  groupId: Group["id"]
  groupName: Group["name"]
  permissions: GroupPermissions
}

const GroupActionBar = ({ groupId, groupName, permissions }: GroupActionBarProps) => {
  const fetcher = useFetcher()

  return (
    <Wrapper axis="horizontal" gap={16}>
      {permissions.settings && (
        <Tooltip>
          <Tooltip.Trigger asChild>
            <LinkButton to={`/groups/${groupId}/settings`} variant="round" aria-label="Club settings">
              <GearIcon />
            </LinkButton>
          </Tooltip.Trigger>
          <Tooltip.Content>Club settings</Tooltip.Content>
        </Tooltip>
      )}
      {permissions.leave && (
        <Dialog>
          <Tooltip>
            <Dialog.Trigger asChild>
              <Tooltip.Trigger asChild>
                <Button variant="round" aria-label="Leave club">
                  <ExitIcon />
                </Button>
              </Tooltip.Trigger>
            </Dialog.Trigger>
            <Tooltip.Content>Leave club</Tooltip.Content>
          </Tooltip>
          <Dialog.Content>
            <Dialog.Close />
            <Dialog.Title>Are you sure you want to leave the club {groupName}?</Dialog.Title>
            <Spacer size={16} />
            This will delete all your scores and comments. This action <strong>cannot be undone.</strong>
            <Spacer size={16} />
            <fetcher.Form method="post" action="/api/groups/leave">
              <input type="hidden" name="groupId" value={groupId} />
              <Button size="large" style={{ marginLeft: "auto" }}>
                I am sure
              </Button>
            </fetcher.Form>
          </Dialog.Content>
        </Dialog>
      )}
    </Wrapper>
  )
}

const Wrapper = styled(Stack)`
  justify-content: center;
`

const GroupLocations = ({
  details,
  showMap,
  permissions,
}: {
  // TODO better type
  details: RecursivelyConvertDatesToStrings<Awaited<ReturnType<typeof getGroupDetails>>>
  showMap: boolean
  permissions: GroupPermissions
}) => {
  if (!details) return null

  const locations = details.group.groupLocations.map((x) => {
    const lunches = x.lunches.map((x) => ({ ...x, avgScore: getAverageNumber(x.scores, "score") }))

    const worstLunch = lunches.sort((a, b) => a.avgScore - b.avgScore).at(0)
    const bestLunch = lunches.sort((a, b) => a.avgScore - b.avgScore).at(-1)
    const lastLunch = lunches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).at(-1)

    return {
      address: x.location.address,
      averageScore: getAverageNumber(lunches, "avgScore"),
      highestScore: bestLunch?.avgScore,
      lowestScore: worstLunch?.avgScore,
      id: x.locationId,
      lat: x.location.lat,
      lon: x.location.lon,
      lunchCount: x.lunches.length,
      name: x.location.name,
      lastVisit: lastLunch?.date,
      location: {
        lat: x.location.lat,
        lon: x.location.lon,
      },
    }
  })

  const mapLocations = locations.filter((x) => x.lunchCount > 0 && x.location.lat && x.location.lon)

  return (
    <>
      <SectionHeader>
        <Subtitle>Locations</Subtitle>
        {permissions.addLocation && (
          <ActionBar>
            <LinkButton to={`/groups/${details.group.id}/locations/new`}>New location</LinkButton>
          </ActionBar>
        )}
      </SectionHeader>
      <Spacer size={8} />
      <SortableTable
        data={locations}
        defaultSort={{ label: "Last visit", key: (row) => row.lastVisit }}
        defaultDirection="desc"
        columns={[
          { label: "Location", key: (row) => row.name },
          { label: "Lunches", key: (row) => row.lunchCount, props: { numeric: true } },
          { label: "Avg rating", key: (row) => row.averageScore, props: { numeric: true } },
          { label: "Lowest rating", key: (row) => row.lowestScore, props: { numeric: true } },
          { label: "Highest rating", key: (row) => row.highestScore, props: { numeric: true } },
          { label: "Last visit", key: (row) => row.lastVisit },
        ]}
      >
        {(location) => (
          <SortableTable.LinkRow
            to={`/groups/${details.group.id}/locations/${location.id}`}
            key={location.id}
          >
            <SortableTable.Cell>{location.name}</SortableTable.Cell>
            <SortableTable.Cell numeric>{location.lunchCount}</SortableTable.Cell>
            <SortableTable.Cell numeric>{formatNumber(location.averageScore)}</SortableTable.Cell>
            <SortableTable.Cell numeric>
              {location.lowestScore ? formatNumber(location.lowestScore) : "-"}
            </SortableTable.Cell>
            <SortableTable.Cell numeric>
              {location.highestScore ? formatNumber(location.highestScore) : "-"}
            </SortableTable.Cell>
            <SortableTable.Cell>
              {location.lastVisit ? formatTimeAgo(new Date(location.lastVisit)) : "-"}
            </SortableTable.Cell>
          </SortableTable.LinkRow>
        )}
      </SortableTable>
      <Spacer size={16} />
      {showMap && (
        <LazyCard>
          <Map
            groupId={details.group.id}
            lat={details.group.lat}
            lon={details.group.lon}
            locations={mapLocations}
          />
        </LazyCard>
      )}
    </>
  )
}
