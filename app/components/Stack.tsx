import styled, { css } from "styled-components";

type Axis = "horizontal" | "vertical";

export const Stack = styled.div<{ gap: number; axis?: Axis }>`
  display: flex;
  flex-direction: ${({ dir }) => (dir === "horizontal" ? "row" : "column")};

  > *:not(:last-child) {
    ${({ dir, gap }) =>
      dir === "horizontal"
        ? css`
            margin-right: ${gap}px;
          `
        : css`
            margin-bottom: ${gap}px;
          `};
  }
`;
