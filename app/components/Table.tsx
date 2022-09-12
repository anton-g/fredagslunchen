import { useNavigate } from "@remix-run/react"
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
  border-spacing: 0;
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

/**
 * Remember to always include a real clickable element in the row for a11y when using this component.
 */
const ClickableRow = ({
  children,
  onClick,
}: {
  children: ReactNode
  onClick: React.MouseEventHandler<HTMLTableRowElement>
}) => {
  return <Row onClick={onClick}>{children}</Row>
}

const Row = styled.tr`
  td:first-child {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
    overflow: hidden;
  }

  td:last-child {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.secondary};
    cursor: pointer;
  }
`

const LinkRow = ({ children, to }: { to: string; children: ReactNode }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(to)
  }

  return <ClickableRow onClick={handleClick}>{children}</ClickableRow>
}

Table.Head = Head
Table.Heading = Heading
Table.Cell = Cell
/**
 * Remember to always include a real clickable element in the row for a11y when using this component.
 */
Table.ClickableRow = ClickableRow
/**
 * Remember to always include a real clickable element in the row for a11y when using this component.
 */
Table.LinkRow = LinkRow

export { Table }
