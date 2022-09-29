import type { ReactNode } from "react"
import React from "react"
import styled, { css } from "styled-components"

type CardProps = {
  variant?: "normal" | "inverted"
  children?: ReactNode
  className?: string
  onClick?: () => void
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "normal", children, className, onClick }, ref) => {
    return (
      <Wrapper
        className={className}
        ref={ref}
        inverted={variant === "inverted"}
        onClick={onClick}
      >
        {children}
      </Wrapper>
    )
  }
)

Card.displayName = "Card"

const Wrapper = styled.div<{ inverted: boolean }>`
  ${({ theme, inverted }) =>
    inverted
      ? css`
          background-color: ${theme.colors.primary};
          color: ${theme.colors.secondary};
          border: 1px solid ${theme.colors.secondary};
        `
      : css`
          background-color: ${theme.colors.secondary};
          color: ${theme.colors.primary};
          border: 2px solid ${theme.colors.primary};
        `}
  border-radius: 8px;
  padding: 16px 24px;
  box-shadow: -5px 5px 0px 0px ${({ theme }) => theme.colors.primary};
  overflow: hidden;
`

export { Card }
