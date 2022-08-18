import * as HoverCardPrimitive from "@radix-ui/react-hover-card"
import styled, { keyframes } from "styled-components"
import { Card } from "./Card"

type HoverCardProps = HoverCardPrimitive.HoverCardProps

const HoverCard = ({ children, ...props }: HoverCardProps) => {
  return (
    <HoverCardPrimitive.Root {...props}>{children}</HoverCardPrimitive.Root>
  )
}

const HoverCardContent = ({
  children,
  ...props
}: HoverCardPrimitive.HoverCardContentProps) => {
  return (
    <StyledContent sideOffset={5} {...props}>
      <Card>{children}</Card>
      <StyledArrow offset={8} />
    </StyledContent>
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

const StyledContent = styled(HoverCardPrimitive.Content)`
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

const StyledArrow = styled(HoverCardPrimitive.Arrow)`
  fill: black;
`

HoverCard.Trigger = HoverCardPrimitive.Trigger
HoverCard.Content = HoverCardContent

export { HoverCard }
