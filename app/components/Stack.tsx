import styled from "styled-components"

type Axis = "horizontal" | "vertical"

export const Stack = styled.div<{
  gap: number
  axis?: Axis
  align?: "flex-start" | "center" | "flex-end"
}>`
  display: flex;
  flex-direction: ${({ axis }) => (axis === "horizontal" ? "row" : "column")};
  gap: ${({ gap }) => gap}px;
  align-items: ${({ align }) => align};
`
