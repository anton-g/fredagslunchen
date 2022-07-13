import styled, { css } from "styled-components";

type ButtonVariant = "normal" | "round";

const Button = styled.button<{ variant?: ButtonVariant }>`
  background-color: ${({ theme }) => theme.colors.secondary};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ variant }) => (variant === "normal" ? "4px" : "50%")};
  position: relative;
  transform: translate(0.15rem, -0.15em);
  transform-style: preserve-3d;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  width: fit-content;
  font-size: 16px;

  ${({ variant }) =>
    variant === "round" &&
    css`
      aspect-ratio: 1/1;
    `}

  transition: transform 75ms ease-in-out;

  ::before {
    box-sizing: border-box;
    position: absolute;
    content: "";
    inset: -2px;
    width: calc(100% + 4px);
    height: calc(100% + 4px);
    background-color: ${({ theme }) => theme.colors.primary};
    transform: translate3d(-0.15rem, 0.15rem, -1em);
    border: inherit;
    border-radius: inherit;

    transition: inherit;
  }

  &:active {
    transform: translate(0rem, 0rem);

    ::before {
      transform: translate3d(0rem, 0rem, -1em);
    }
  }
`;

Button.defaultProps = {
  variant: "normal",
};

export { Button };
