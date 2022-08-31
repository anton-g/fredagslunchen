import type { ReactNode } from "react"
import styled from "styled-components"
import { Card } from "./Card"

// TODO: Add body, row etc to component
const Table = ({ children }: { children: ReactNode }) => {
  return (
    <Wrapper>
      <Root>{children}</Root>
    </Wrapper>
  )
}

const Wrapper = styled(Card)`
  width: 100%;
  overflow-x: auto;
  padding: 16px 12px;
`

const Root = styled.table`
  width: 100%;
`

const Head = styled.thead``

const Heading = styled.th<{ numeric?: boolean; wide?: boolean }>`
  text-align: ${({ numeric }) => (numeric ? "right" : "left")};
  padding: 4px 12px;
  white-space: nowrap;
  width: ${({ wide }) => (wide ? "100%" : "auto")}; ;
`

const Cell = styled.td<{ numeric?: boolean; wide?: boolean }>`
  text-align: ${({ numeric }) => (numeric ? "right" : "left")};
  padding: 4px 12px;
  white-space: nowrap;
  width: ${({ wide }) => (wide ? "100%" : "auto")};

  a {
    text-decoration: underline;
  }
`

Table.Head = Head
Table.Heading = Heading
Table.Cell = Cell

export { Table }
