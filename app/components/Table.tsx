import type { ReactNode } from "react"
import styled from "styled-components"
import { Card } from "./Card"

const Table = ({ children }: { children: ReactNode }) => {
  return (
    <Wrapper>
      <Root>{children}</Root>
    </Wrapper>
  )
}

const Wrapper = styled(Card)`
  width: 100%;
  overflow-x: scroll;
  padding: 16px 12px;
`

const Root = styled.table`
  width: 100%;
`

const Head = styled.thead``

const Heading = styled.th<{ numeric?: boolean }>`
  text-align: ${({ numeric }) => (numeric ? "right" : "left")};
  padding: 4px 12px;
  white-space: nowrap;
`

const Cell = styled.td<{ numeric?: boolean }>`
  text-align: ${({ numeric }) => (numeric ? "right" : "left")};
  padding: 4px 12px;
  white-space: nowrap;

  a {
    text-decoration: underline;
  }
`

Table.Head = Head
Table.Heading = Heading
Table.Cell = Cell

export { Table }
