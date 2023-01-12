import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useCatch, useLoaderData } from "@remix-run/react"
import invariant from "tiny-invariant"
import { ResponsiveLine } from "@nivo/line"

import {
  getGroupDetails,
  getGroupPermissionsForRequest,
} from "~/models/group.server"
import styled from "styled-components"
import { Spacer } from "~/components/Spacer"
import { getUserId } from "~/session.server"
import { format } from "date-fns"
import { Card } from "~/components/Card"
import type { LunchStat } from "~/models/lunch.server"
import { getGroupLunchStats } from "~/models/lunch.server"
import { Stack } from "~/components/Stack"

export const loader = async ({ request, params }: LoaderArgs) => {
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

  const stats = await getGroupLunchStats({ id: params.groupId })

  return json({ stats })
}

export default function GroupStatsPage() {
  const { stats } = useLoaderData<typeof loader>()

  const lunchData = stats
    .filter((s) => s.stats.avg !== null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const points = lunchData.map((s) => ({
    x: format(new Date(s.date), "yyyy-MM-dd"),
    y: s.stats.avg,
    lunch: s,
  }))

  const data = [
    {
      id: "Lunches",
      color: "#000",
      data: points,
    },
  ]

  const getTickValues = () => {
    const dates = lunchData.map((x) => new Date(x.date).getTime())
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

  return (
    <div>
      <Title>Statistics</Title>
      <Spacer size={8} />
      <Subtitle>All lunches</Subtitle>
      <div style={{ height: 200 }}>
        <ResponsiveLine
          data={data}
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
          // useMesh={true}
          // yFormat=" >-.2f"
          axisBottom={{
            format: "%b %d",
            tickValues: getTickValues(),
            // tickSize: 5,
            // tickPadding: 5,
            // tickRotation: -24,
            // legend: "transportation",
            // legendOffset: 36,
            // legendPosition: "middle",
          }}
          axisLeft={{
            tickValues: [0, 2, 4, 6, 8, 10],
            // tickSize: 5,
            // tickPadding: 5,
            // tickRotation: 0,
            // legend: "count",
            // legendOffset: -40,
            // legendPosition: "middle",
          }}
          enableSlices="x"
          sliceTooltip={({ slice }) => {
            return (
              <Card>
                {slice.points.map((point) => {
                  // @ts-expect-error
                  const lunch = point.data.lunch as LunchStat

                  return (
                    <Stack
                      axis="horizontal"
                      gap={18}
                      key={point.id}
                      style={{ alignItems: "center" }}
                    >
                      <Stack gap={4}>
                        <strong>{lunch.groupLocation.location.name}</strong>
                        {point.data.xFormatted}
                      </Stack>
                      <span style={{ fontSize: 32, fontWeight: "bold" }}>
                        {point.data.yFormatted}
                      </span>
                    </Stack>
                  )
                })}
              </Card>
            )
          }}

          // legends={[
          //   {
          //     anchor: "bottom-right",
          //     direction: "column",
          //     justify: false,
          //     translateX: 100,
          //     translateY: 0,
          //     itemsSpacing: 0,
          //     itemDirection: "left-to-right",
          //     itemWidth: 80,
          //     itemHeight: 20,
          //     itemOpacity: 0.75,
          //     symbolSize: 12,
          //     symbolShape: "circle",
          //     symbolBorderColor: "rgba(0, 0, 0, .5)",
          //     effects: [
          //       {
          //         on: "hover",
          //         style: {
          //           itemBackground: "rgba(0, 0, 0, .03)",
          //           itemOpacity: 1,
          //         },
          //       },
          //     ],
          //   },
          // ]}
        />
      </div>
    </div>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error)

  return <div>An unexpected error occurred: {error.message}</div>
}

export function CatchBoundary() {
  const caught = useCatch()

  if (caught.status === 404) {
    return (
      <div>
        <h2>Club not found</h2>
      </div>
    )
  }

  if (caught.status === 401) {
    return (
      <div>
        <h2>Access denied</h2>
        If someone sent you this link, ask them to add you to their club.
      </div>
    )
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`)
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
