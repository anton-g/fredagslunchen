import { json, type LoaderFunctionArgs } from "@remix-run/node"
import { isRouteErrorResponse, useLoaderData, useRouteError, useSearchParams } from "@remix-run/react"
import invariant from "tiny-invariant"
import { ResponsiveLine } from "@nivo/line"
import { getGroupDetailedStats, getGroupDetails, getGroupPermissionsForRequest } from "~/models/group.server"
import styled from "styled-components"
import { Spacer } from "~/components/Spacer"
import { getUserId } from "~/auth.server"
import { format } from "date-fns"
import { Card } from "~/components/Card"
import {
  getGroupLunchStats,
  getGroupLunchStatsPerMember,
  type FullLunch,
  type GroupMembersWithScores,
  type LunchStat,
} from "~/models/lunch.server"
import { Stack } from "~/components/Stack"
import { formatNumber, type RecursivelyConvertDatesToStrings } from "~/utils"
import type { ComponentProps } from "react"
import { StatsGrid } from "~/components/StatsGrid"
import { Stat } from "~/components/Stat"
import { Input } from "~/components/Input"
import { Button } from "~/components/Button"

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await getUserId(request)
  invariant(params.groupId, "groupId not found")

  const details = await getGroupDetails({ id: params.groupId })
  if (!details) {
    throw new Response("Not Found", { status: 404 })
  }

  const permissions = await getGroupPermissionsForRequest({
    request,
    group: details.group,
  })

  if (!permissions.view) {
    throw new Response("Unauthorized", { status: 401 })
  }

  const url = new URL(request.url)
  const from = url.searchParams.get("from")
  const to = url.searchParams.get("to")
  const fromDate = from ? new Date(from) : undefined
  const toDate = to ? new Date(to) : undefined
  const groupLunches = await getGroupLunchStats({ id: params.groupId, from: fromDate, to: toDate })
  const groupMemberScores = await getGroupLunchStatsPerMember({
    id: params.groupId,
    from: fromDate,
    to: toDate,
  })
  const groupDetailStats = await getGroupDetailedStats({ id: params.groupId, from: fromDate, to: toDate })

  if (!groupDetailStats) {
    throw new Response("Not Found", { status: 404 })
  }

  return json({ groupLunches, groupMemberScores, details: groupDetailStats })
}

export default function GroupStatsPage() {
  const { groupLunches, groupMemberScores, details } = useLoaderData<typeof loader>()

  const [searchParams] = useSearchParams()
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  return (
    <div>
      <Title>Statistics</Title>
      <Spacer size={24} />
      <form>
        <Stack axis="horizontal" gap={16}>
          <div>
            <label
            //  htmlFor={name.id}
            >
              From
            </label>
            <div>
              <Input
                type="date"
                name="from"
                defaultValue={from || undefined}
                // {...conform.input(name, { ariaAttributes: true })}
              />
              {/* {name.error && <div id={`${name.id}-error`}>{name.error}</div>} */}
            </div>
          </div>
          <div>
            <label
            //  htmlFor={name.id}
            >
              To
            </label>
            <div>
              <Input
                type="date"
                name="to"
                defaultValue={to || undefined}
                // {...conform.input(name, { ariaAttributes: true })}
              />
              {/* {name.error && <div id={`${name.id}-error`}>{name.error}</div>} */}
            </div>
          </div>
          <Button type="submit">Filter</Button>
        </Stack>
      </form>
      <Spacer size={24} />
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
      <Spacer size={24} />
      <Subtitle>All lunches</Subtitle>
      <GroupLunchesLineGraph data={groupLunches} />
      <Spacer size={24} />
      <Subtitle>All scores</Subtitle>
      <GroupMemberScoresLineGraph data={groupMemberScores} />
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

const Title = styled.h2`
  font-size: 48px;
  margin: 0;
`

const theme = {
  background: "#ffffff",
  textColor: "#000",
  axis: {
    domain: {
      line: {
        stroke: "#000",
        strokeWidth: 2,
      },
    },
    legend: {
      text: {
        fontSize: 12,
        fill: "#333333",
      },
    },
    ticks: {
      line: {
        stroke: "#000",
        strokeWidth: 1,
      },
      text: {
        fontSize: 12,
        fill: "#000",
      },
    },
  },
  grid: {
    line: {
      stroke: "#dddddd",
      strokeWidth: 1,
    },
  },
  legends: {
    title: {
      text: {
        fontSize: 11,
        fill: "#333333",
      },
    },
    text: {
      fontSize: 11,
      fill: "#333333",
    },
    ticks: {
      line: {},
      text: {
        fontSize: 10,
        fill: "#333333",
      },
    },
  },
  annotations: {
    text: {
      fontSize: 13,
      fill: "#333333",
      outlineWidth: 2,
      outlineColor: "#ffffff",
      outlineOpacity: 1,
    },
    link: {
      stroke: "#000000",
      strokeWidth: 1,
      outlineWidth: 2,
      outlineColor: "#ffffff",
      outlineOpacity: 1,
    },
    outline: {
      stroke: "#000000",
      strokeWidth: 2,
      outlineWidth: 2,
      outlineColor: "#ffffff",
      outlineOpacity: 1,
    },
    symbol: {
      fill: "#000000",
      outlineWidth: 2,
      outlineColor: "#ffffff",
      outlineOpacity: 1,
    },
  },
  tooltip: {
    basic: {},
    chip: {},
    table: {},
    tableCell: {},
    tableCellValue: {},
  },
}

const Subtitle = styled.h3`
  font-size: 24px;
  margin: 16px 0;
`

const GroupLunchesLineGraph = ({ data }: { data: RecursivelyConvertDatesToStrings<LunchStat>[] }) => {
  const lunchData = data
    .filter((s) => s.stats.avg !== null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const points = lunchData.map((s) => ({
    x: format(new Date(s.date), "yyyy-MM-dd"),
    y: s.stats.avg,
    lunch: s,
  }))

  const graphData = [
    {
      id: "Lunches",
      data: points,
    },
  ]

  return (
    <div style={{ height: 200 }}>
      <ResponsiveLine
        data={graphData}
        colors={["#000"]}
        theme={theme}
        margin={{ top: 0, right: 8, bottom: 0, left: 16 }}
        xScale={{
          type: "time",
          format: "%Y-%m-%d",
          useUTC: false,
          precision: "day",
        }}
        xFormat="time:%Y-%m-%d"
        yScale={{
          type: "linear",
          min: 0,
          max: 10,
          stacked: false,
          reverse: false,
        }}
        yFormat={(value) =>
          `${Number(value).toLocaleString("en-US", {
            maximumFractionDigits: 2,
          })}`
        }
        pointSize={10}
        pointColor={{ theme: "background" }}
        pointBorderWidth={2}
        pointBorderColor={{ from: "serieColor" }}
        pointLabelYOffset={-12}
        axisBottom={{
          format: "%b %d",
          tickValues: getTickValues(lunchData),
        }}
        axisLeft={{
          tickValues: [0, 2, 4, 6, 8, 10],
        }}
        enableSlices="x"
        sliceTooltip={({ slice }) => {
          return (
            <Card>
              {slice.points.map((point) => {
                // @ts-expect-error
                const lunch = point.data.lunch as GroupLunchStat

                return (
                  <Stack axis="horizontal" gap={18} key={point.id} style={{ alignItems: "center" }}>
                    <Stack gap={4}>
                      <strong>{lunch.groupLocation.location.name}</strong>
                      {point.data.xFormatted}
                    </Stack>
                    <span style={{ fontSize: 32, fontWeight: "bold" }}>{point.data.yFormatted}</span>
                  </Stack>
                )
              })}
            </Card>
          )
        }}
      />
    </div>
  )
}

const GroupMemberScoresLineGraph = ({
  data,
}: {
  data: RecursivelyConvertDatesToStrings<GroupMembersWithScores>
}) => {
  const graphData = data
    .filter((x) => x.scores.length > 0)
    .map((x) => ({
      id: x.name,
      data: x.scores
        .sort((a, b) => new Date(a.lunch.date).getTime() - new Date(b.lunch.date).getTime())
        .map((s) => ({
          x: format(new Date(s.lunch.date), "yyyy-MM-dd"),
          y: s.score,
          user: x.name,
          lunch: s.lunch,
        })),
    }))

  const lunches = data.flatMap((x) => x.scores.map((s) => s.lunch))

  const { legends, margin } = wrappedLegend(graphData, 6, {
    anchor: "bottom",
    direction: "row",
    justify: false,
    toggleSerie: true,
    translateX: 0,
    translateY: 50,
    itemsSpacing: 32,
    itemDirection: "left-to-right",
    itemWidth: 80,
    itemHeight: 20,
    itemOpacity: 0.75,
    symbolSize: 12,
    symbolShape: "circle",
  })

  return (
    <div style={{ height: 200 + margin }}>
      <ResponsiveLine
        data={graphData}
        colors={colors}
        theme={theme}
        margin={{ top: 0, right: 8, bottom: margin, left: 16 }}
        xScale={{
          type: "time",
          format: "%Y-%m-%d",
          useUTC: false,
          precision: "day",
        }}
        xFormat="time:%Y-%m-%d"
        yScale={{
          type: "linear",
          min: 0,
          max: 10,
          stacked: false,
          reverse: false,
        }}
        yFormat={(value) =>
          `${Number(value).toLocaleString("en-US", {
            maximumFractionDigits: 2,
          })}`
        }
        pointSize={10}
        pointColor={{ theme: "background" }}
        pointBorderWidth={2}
        pointBorderColor={{ from: "serieColor" }}
        pointLabelYOffset={-12}
        axisBottom={{
          format: "%b %d",
          tickValues: getTickValues(lunches),
        }}
        axisLeft={{
          tickValues: [0, 2, 4, 6, 8, 10],
        }}
        enableSlices="x"
        legends={legends}
        sliceTooltip={({ slice }) => {
          // @ts-expect-error
          const lunch = slice.points[0].data.lunch as FullLunch

          return (
            <Card>
              <Stack gap={0}>
                <strong>{lunch.groupLocation.location.name}</strong>
                {slice.points[0].data.xFormatted}
              </Stack>
              <Spacer size={8} />
              <Stack gap={4}>
                {slice.points.map((point) => {
                  // @ts-expect-error
                  const user = point.data.user as string
                  return (
                    <Stack
                      key={point.id}
                      axis="horizontal"
                      gap={18}
                      style={{
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <strong>{user}</strong>
                      <span style={{ fontSize: 16 }}>{point.data.yFormatted}</span>
                    </Stack>
                  )
                })}
              </Stack>
            </Card>
          )
        }}
      />
    </div>
  )
}

const colors = [
  "red",
  "green",
  "yellow",
  "blue",
  "snow",
  "palegoldenrod",
  "aliceblue",
  "blueviolet",
  "brown",
  "cadetblue",
  "coral",
  "cornsilk",
  "darkgreen",
  "darkorange",
  "darksalmon",
  "darkturquoise",
  "dodgerblue",
  "gold",
  "greenyellow",
  "indigo",
  "lightgreen",
  "maroon",
  "mediumspringgreen",
  "olive",
  "palevioletred",
  "sienna",
  "thistle",
  "wheat",
  "yellowgreen",
  "teal",
]

type LegendProps = NonNullable<ComponentProps<typeof ResponsiveLine>["legends"]>[0]
function wrappedLegend<T extends { id: string }>(data: T[], columns: number, legendProps: LegendProps) {
  const translateY = legendProps.translateY || 0

  if (data.length <= columns) {
    return { legends: [legendProps], margin: 0 }
  }

  const rows = Math.ceil(data.length / columns)

  const legends: LegendProps[] = []

  for (let i = 0; i < rows; i++) {
    legends.push({
      ...legendProps,
      translateY: translateY + i * 30,
      data: data.slice(i * columns, (i + 1) * columns).map((cur, index) => ({
        id: cur.id,
        label: cur.id,
        color: colors.slice(i * columns, (i + 1) * columns)[index],
      })),
    })
  }

  return { legends, margin: 30 * rows }
}

const getTickValues = (data: { date: string }[]) => {
  const dates = data.map((x) => new Date(x.date).getTime())
  const min = Math.min(...dates)
  const max = Math.max(...dates)

  const distance = max - min
  const distanceInDays = distance / 1000 / 60 / 60 / 24

  if (distanceInDays > 365) return "every 2 months"
  if (distanceInDays > 365 / 2) return "every month"
  if (distanceInDays > 30 * 3) return "every 2 weeks"
  if (distanceInDays > 7 * 5) return "every week"
  if (distanceInDays > 7 * 2) return "every 2 days"

  return "every day"
}
