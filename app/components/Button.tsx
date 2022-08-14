import { Link as RemixLink } from "@remix-run/react";
import styled, { css } from "styled-components";

type ButtonVariant = "normal" | "round" | "large";

const styles = css<{ variant?: ButtonVariant }>`
  color: ${({ theme }) => theme.colors.primary};
  background-color: ${({ theme }) => theme.colors.secondary};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ variant }) => (variant === "round" ? "50%" : "4px")};
  position: relative;
  transform: translate(0.15rem, -0.15em);
  transform-style: preserve-3d;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  width: fit-content;
  font-size: ${({ variant }) => (variant === "large" ? "18px" : "16px")};
  transition: transform 75ms ease-in-out;
  padding: ${({ variant }) => (variant === "large" ? "4px 8px" : "2px 6px")};
  height: fit-content;

  ${({ variant }) =>
    variant === "round" &&
    css`
      aspect-ratio: 1/1;
    `}

  ::before {
    content: "";
    box-sizing: border-box;
    position: absolute;
    inset: -2px;
    width: calc(100% + 4px);
    height: calc(100% + 4px);
    background-color: ${({ theme }) => theme.colors.primary};
    transform: translate3d(-0.15rem, 0.15rem, -1em);
    border: inherit;
    border-radius: inherit;
    transition: inherit;
  }

  &:hover {
    transform: translate(0.11rem, -0.11rem);

    ::before {
      transform: translate3d(-0.11rem, 0.11rem, -1em);
    }
  }

  &:active {
    transform: translate(0rem, 0rem);

    ::before {
      transform: translate3d(0rem, 0rem, -1em);
    }
  }
`;

const Button = styled.button<{ variant?: ButtonVariant }>`
  ${styles}
`;

Button.defaultProps = {
  variant: "normal",
};

const LinkButton = styled(RemixLink)<{ variant?: ButtonVariant }>`
  ${styles}
`;

LinkButton.defaultProps = {
  variant: "normal",
};

export { Button, LinkButton };
