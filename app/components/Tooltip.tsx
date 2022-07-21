import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import styled, { keyframes } from "styled-components";
import type { ComponentProps, ReactNode } from "react";

const slideUpAndFade = keyframes({
  "0%": { opacity: 0, transform: "translateY(2px)" },
  "100%": { opacity: 1, transform: "translateY(0)" },
});

const slideRightAndFade = keyframes({
  "0%": { opacity: 0, transform: "translateX(-2px)" },
  "100%": { opacity: 1, transform: "translateX(0)" },
});

const slideDownAndFade = keyframes({
  "0%": { opacity: 0, transform: "translateY(-2px)" },
  "100%": { opacity: 1, transform: "translateY(0)" },
});

const slideLeftAndFade = keyframes({
  "0%": { opacity: 0, transform: "translateX(2px)" },
  "100%": { opacity: 1, transform: "translateX(0)" },
});

const StyledContent = styled(TooltipPrimitive.Content)`
  border-radius: 4px;
  padding: 16px 12px;
  font-size: 16px;
  line-height: 1px;
  color: ${({ theme }) => theme.colors.primary};
  background-color: ${({ theme }) => theme.colors.secondary};
  user-select: none;
  border: 2px solid ${({ theme }) => theme.colors.primary};

  @media (prefers-reduced-motion: no-preference) {
    animation-duration: 400ms;
    animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
    will-change: transform, opacity;

    &[data-state="delayed-open"] {
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
`;

const StyledArrow = styled(TooltipPrimitive.Arrow)`
  fill: ${({ theme }) => theme.colors.primary};
`;

const Content: React.FC<ComponentProps<typeof TooltipPrimitive.Content>> = ({
  children,
  ...props
}) => {
  return (
    <TooltipPrimitive.Portal>
      <StyledContent {...props}>
        {children}
        <StyledArrow />
      </StyledContent>
    </TooltipPrimitive.Portal>
  );
};

const Tooltip = ({ children }: { children: ReactNode }) => {
  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root>{children}</TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};

Tooltip.Trigger = TooltipPrimitive.Trigger;
Tooltip.Content = Content;

export { Tooltip };
