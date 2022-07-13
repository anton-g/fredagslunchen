import styled, { css } from "styled-components";

type Axis = "horizontal" | "vertical";

export const Stack = styled.div<{ gap: number; axis?: Axis }>`
  display: flex;
  flex-direction: ${({ axis }) => (axis === "horizontal" ? "row" : "column")};

  > *:not(:last-child) {
    ${({ axis, gap }) =>
      axis === "horizontal"
        ? css`
            margin-right: ${gap}px;
          `
        : css`
            margin-bottom: ${gap}px;
          `};
  }
`;
