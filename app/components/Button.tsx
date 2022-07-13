import type { FC } from "react";
import styled, { css } from "styled-components";

type ButtonVariant = "normal" | "round";

type ButtonProps = {
  variant?: ButtonVariant;
};

export const Button: FC<ButtonProps> = ({ children, variant = "normal" }) => {
  return <StyledButton variant={variant}>{children}</StyledButton>;
};

const StyledButton = styled.button<{ variant: ButtonVariant }>`
  background-color: white;
  border: 2px solid black;
  border-radius: ${({ variant }) => (variant === "normal" ? "4px" : "50%")};
  position: relative;
  transform: translate(0.15rem, -0.15em);
  transform-style: preserve-3d;
  box-sizing: border-box;
  display: flex;
  align-items: center;

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
    background-color: black;
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
