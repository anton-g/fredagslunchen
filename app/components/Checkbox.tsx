import type { ComponentProps, FC } from "react"
import styled, { css } from "styled-components"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Cross2Icon } from "@radix-ui/react-icons"

type CheckboxVariant = "normal" | "large"

const Checkbox: FC<ComponentProps<typeof CheckboxPrimitive.Root> & { variant?: CheckboxVariant }> = ({
  variant = "normal",
  ...props
}) => {
  return (
    <StyledCheckbox {...props} variant={variant}>
      <StyledIndicator>
        <Cross2Icon />
      </StyledIndicator>
    </StyledCheckbox>
  )
}

const StyledCheckbox = styled(CheckboxPrimitive.Root)<{
  variant: CheckboxVariant
}>`
  background-color: ${({ theme }) => theme.colors.secondary};
  width: ${({ variant }) => (variant === "large" ? 32 : 22)}px;
  height: ${({ variant }) => (variant === "large" ? 32 : 22)}px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${({ theme }) => theme.colors.primary};

  ${({ variant }) =>
    variant === "large" &&
    css`
      svg {
        width: 24px;
        height: 24px;
      }
    `}
`

const StyledIndicator = styled(CheckboxPrimitive.Indicator)`
  color: ${({ theme }) => theme.colors.primary};
`

export { Checkbox }
