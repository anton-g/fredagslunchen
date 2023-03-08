import * as PopoverPrimitive from "@radix-ui/react-popover"
import styled, { keyframes } from "styled-components"
import { Card } from "./Card"

type PopoverProps = PopoverPrimitive.PopoverProps

const Popover = ({ children, ...props }: PopoverProps) => {
  return <PopoverPrimitive.Root {...props}>{children}</PopoverPrimitive.Root>
}

const PopoverContent = ({
  children,
  ...props
}: PopoverPrimitive.PopoverContentProps) => {
  return (
    <PopoverPrimitive.Portal>
      <StyledContent sideOffset={5} {...props}>
        <Card>{children}</Card>
        <StyledArrow offset={8} />
      </StyledContent>
    </PopoverPrimitive.Portal>
  )
}

const slideUpAndFade = keyframes`
  0% { opacity: 0; transform: translateY(2px) };
  100% { opacity: 1; transform: translateY(0) };
`

const slideRightAndFade = keyframes`
  0% { opacity: 0; transform: translateX(-2px) };
  100% { opacity: 1; transform: translateX(0) };
`

const slideDownAndFade = keyframes`
  0% { opacity: 0; transform: translateY(-2px) };
  100% { opacity: 1; transform: translateY(0) };
`

const slideLeftAndFade = keyframes`
  0% { opacity: 0; transform: translateX(2px) };
  100% { opacity: 1; transform: translateX(0) };
`

const StyledContent = styled(PopoverPrimitive.Content)`
  max-width: min(400px, 90vw);
  white-space: pre-wrap;

  &:focus {
    outline: none;
  }

  @media (prefers-reduced-motion: no-preference) {
    animation-duration: 400ms;
    animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
    animation-fill-mode: forwards;
    will-change: transform, opacity;
    &[data-state="open"] {
      &[data-side="top"] {
        animation-name: ${slideDownAndFade};
      }
      &[data-side="right"] {
        animation-name: ${slideLeftAndFade};
      }
      &[data-side="bottom"] {
        animation-name: ${slideUpAndFade};
      }
      &[data-side="left"] {
        animation-name: ${slideRightAndFade};
      }
    }
  }
`

const StyledArrow = styled(PopoverPrimitive.Arrow)`
  fill: black;
`

Popover.Trigger = PopoverPrimitive.Trigger
Popover.Content = PopoverContent

export { Popover }
