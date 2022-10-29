import { Link as RemixLink, NavLink as RemixNavLink } from "@remix-run/react"
import styled, { css } from "styled-components"
import type { CustomColors } from "~/styles/styled"

type ButtonVariant = "normal" | "round" | "inverted"
type ButtonSize = "normal" | "large" | "huge"

const buttonColors: Record<ButtonVariant, keyof CustomColors> = {
  inverted: "secondary",
  normal: "primary",
  round: "primary",
}

const buttonBackgroundColors: Record<ButtonVariant, keyof CustomColors> = {
  inverted: "primary",
  normal: "secondary",
  round: "secondary",
}

const buttonFontSizes: Record<ButtonSize, string> = {
  normal: "16px",
  large: "18px",
  huge: "22px",
}

const buttonPaddings: Record<ButtonSize, string> = {
  normal: "2px 6px",
  large: "4px 8px",
  huge: "6px 22px",
}

const styles = css<{ variant?: ButtonVariant; size?: ButtonSize }>`
  color: ${({ theme, variant }) =>
    theme.colors[buttonColors[variant || "normal"]]};
  background-color: ${({ theme, variant }) =>
    theme.colors[buttonBackgroundColors[variant || "normal"]]};
  border: ${({ variant }) => (variant === "inverted" ? "1px" : "2px")} solid
    ${({ theme, variant }) =>
      variant === "inverted" ? theme.colors.secondary : theme.colors.primary};
  border-radius: ${({ variant }) => (variant === "round" ? "50%" : "4px")};
  position: relative;
  transform: translate(0.15rem, -0.15em);
  transform-style: preserve-3d;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  width: fit-content;
  font-size: ${({ size }) => buttonFontSizes[size || "normal"]};
  transition: transform 75ms ease-in-out;
  padding: ${({ size }) => buttonPaddings[size || "normal"]};
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

  &:disabled {
    transform: translate(0rem, 0rem);
    cursor: not-allowed;

    ::before {
      transform: translate3d(0rem, 0rem, -1em);
    }
  }
`

const Button = styled.button<{ variant?: ButtonVariant; size?: ButtonSize }>`
  ${styles}
`

Button.defaultProps = {
  variant: "normal",
}

const LinkButton = styled(RemixLink)<{
  variant?: ButtonVariant
  size?: ButtonSize
}>`
  ${styles}
`

LinkButton.defaultProps = {
  variant: "normal",
}

const ExternalLinkButton = styled("a")<{
  variant?: ButtonVariant
  size?: ButtonSize
}>`
  ${styles}
`

ExternalLinkButton.defaultProps = {
  variant: "normal",
}

const NavLink = styled(RemixNavLink)`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.secondary};
  padding: 2px 4px;

  transform: rotateZ(2deg);

  &:nth-child(even) {
    transform: rotateZ(-2deg);
  }
`

const TextButton = styled.button`
  color: ${({ theme }) => theme.colors.primary};
  background-color: transparent;
  border: 0;
  position: relative;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  width: fit-content;
  font-size: 16px;
  padding: 2px 6px;
  height: fit-content;
  text-decoration: underline;
  cursor: pointer;
`

const UnstyledButton = styled.button`
  all: unset;
  width: fit-content;
  cursor: pointer;
`

export {
  Button,
  LinkButton,
  NavLink,
  TextButton,
  UnstyledButton,
  ExternalLinkButton,
}
