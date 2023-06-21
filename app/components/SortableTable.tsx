import type { ComponentProps, ReactNode } from "react"
import { useState } from "react"
import styled from "styled-components"
import { Stack } from "./Stack"
import { Table } from "./Table"

type SortKey<T> = Extract<keyof T, string> | ((row: T) => any)
type SortDirection = "asc" | "desc"
type SortableColumn<T> = { key: SortKey<T>; label: string; props?: ComponentProps<typeof Table.Heading> }

function SortableTable<T>({
  children,
  columns,
  defaultSort,
  data,
}: {
  children: (row: T) => ReactNode
  columns: SortableColumn<T>[]
  defaultSort: SortableColumn<T>
  data: T[]
}) {
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [sortedColumn, setSortedColumn] = useState<SortableColumn<T> | undefined>(defaultSort)

  const sortedData = data.sort((a, b) => {
    if (!sortedColumn) {
      return 0
    }

    const sortKey = sortedColumn.key

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
          {columns.map((column) => (
            <TableHeading key={column.label} onClick={() => updateSort(column)}>
              <Stack axis="horizontal" gap={4}>
                {column.label}
                {sortedColumn?.label === column.label ? (
                  <span style={sortDirection === "desc" ? { transform: "rotateZ(90deg)" } : undefined}>
                    ↗
                  </span>
                ) : (
                  <span> </span>
                )}
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
