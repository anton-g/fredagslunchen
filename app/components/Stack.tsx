import styled from "styled-components"

type Axis = "horizontal" | "vertical"

export const Stack = styled.div<{ gap: number; axis?: Axis }>`
  display: flex;
  flex-direction: ${({ axis }) => (axis === "horizontal" ? "row" : "column")};
  gap: ${({ gap }) => gap}px;
`
