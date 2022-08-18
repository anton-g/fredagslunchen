import * as SwitchPrimitive from "@radix-ui/react-switch"
import styled from "styled-components"

const StyledSwitch = styled(SwitchPrimitive.Root)`
  all: unset;
  width: 42px;
  height: 25px;
  background-color: ${({ theme }) => theme.colors.secondary};
  border-radius: 9999px;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  position: relative;

  &:focus {
    outline: inherit;
  }
`

const StyledThumb = styled(SwitchPrimitive.Thumb)`
  display: block;
  width: 21px;
  height: 21px;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 9999px;
  transition: transform 100ms;
  transform: translateX(2px);
  will-change: transform;

  &[data-state="checked"] {
    transform: translateX(19px);
  }
`

export const Switch = StyledSwitch
export const SwitchThumb = StyledThumb
