import { Link } from "@remix-run/react"
import { forwardRef } from "react"
import styled from "styled-components"

type StatSize = "small" | "normal"

type StatProps = {
  label: string
  value: number | string
  to?: string
  detail?: string
  size?: StatSize
}

export const Stat = forwardRef<HTMLDivElement, StatProps>(
  ({ label, value, to, detail, size = "normal" }, ref) => {
    return (
      <StatWrapper ref={ref} size={size}>
        <h3>{label}</h3>
        <div style={{ display: "flex", alignItems: "baseline" }}>
          {to ? (
            <StatLink to={to} size={size}>
              {value}
            </StatLink>
          ) : (
            <Value size={size}>{value}</Value>
          )}
          {detail && <Detail>{detail}</Detail>}
        </div>
      </StatWrapper>
    )
  }
)

Stat.displayName = "Stat"

const StatWrapper = styled.div<{ size: StatSize }>`
  display: flex;
  flex-direction: column;

  h3 {
    font-weight: normal;
    font-size: ${({ size }) => (size === "normal" ? 14 : 12)}px;
    margin: 0;
  }
`

const StatLink = styled(Link)<{ size: StatSize }>`
  font-weight: bold;
  font-size: ${({ size }) => (size === "normal" ? 24 : 18)}px;
  width: fit-content;

  &:hover {
    text-decoration: underline;
  }
`

const Value = styled.span<{ size: StatSize }>`
  font-weight: bold;
  font-size: ${({ size }) => (size === "normal" ? 24 : 18)}px;
  white-space: nowrap;
  max-width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
`

const Detail = styled.span`
  font-size: 12px;
  font-weight: normal;
  margin-left: 4px;
`
