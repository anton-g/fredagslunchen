import type { ComponentProps, ReactNode } from "react"
import { useState } from "react"
import styled from "styled-components"
import { Stack } from "./Stack"
import { Table } from "./Table"

type SortKey<T> = Extract<keyof T, string> | ((row: T) => any)
type SortDirection = "asc" | "desc"
type SortableColumn<T> = { key?: SortKey<T>; label: string; props?: ComponentProps<typeof Table.Heading> }

function SortableTable<T>({
  children,
  columns,
  defaultSort,
  defaultDirection = "asc",
  data,
}: {
  children: (row: T) => ReactNode
  columns: SortableColumn<T>[]
  defaultSort: SortableColumn<T>
  defaultDirection?: SortDirection
  data: T[]
}) {
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultDirection)
  const [sortedColumn, setSortedColumn] = useState<SortableColumn<T> | undefined>(defaultSort)

  const sortedData = data.sort((a, b) => {
    if (!sortedColumn) {
      return 0
    }

    const sortKey = sortedColumn.key

    if (!sortKey) return 0

    const aKey = (typeof sortKey === "function" ? sortKey(a) : a[sortKey]) ?? ""
    const bKey = (typeof sortKey === "function" ? sortKey(b) : b[sortKey]) ?? ""

    if (aKey < bKey) {
      return sortDirection === "asc" ? -1 : 1
    }
    if (aKey > bKey) {
      return sortDirection === "asc" ? 1 : -1
    }
    return 0
  })

  const updateSort = (column: SortableColumn<T>) => {
    if (sortedColumn?.label === column.label) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortedColumn(column)
      setSortDirection("desc")
    }
  }

  return (
    <Table>
      <Table.Head>
        <tr>
          {columns.map((column, i) => (
            <TableHeading
              key={column.label}
              onClick={() => column.key && updateSort(column)}
              {...column.props}
            >
              <Stack
                axis="horizontal"
                gap={4}
                style={{ justifyContent: column.props?.numeric ? "flex-end" : undefined }}
              >
                {column.label}
                <span
                  style={{
                    transform: sortDirection === "desc" ? "rotateZ(90deg)" : undefined,
                    visibility: sortedColumn?.label === column.label ? "visible" : "hidden",
                    display:
                      sortedColumn?.label !== column.label &&
                      i === columns.length - 1 &&
                      column.props?.numeric
                        ? "none"
                        : "inline",
                  }}
                >
                  ↗
                </span>
              </Stack>
            </TableHeading>
          ))}
        </tr>
      </Table.Head>
      <tbody>{sortedData.map(children)}</tbody>
    </Table>
  )
}

const TableHeading = styled(Table.Heading)`
  cursor: pointer;
`

SortableTable.Cell = Table.Cell
SortableTable.ClickableRow = Table.ClickableRow
SortableTable.LinkRow = Table.LinkRow

export { SortableTable }
