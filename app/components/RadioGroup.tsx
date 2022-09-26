import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import type { ComponentProps, FC } from "react"
import styled from "styled-components"

const RadioGroup = (props: ComponentProps<typeof RadioGroupPrimitive.Root>) => {
  return (
    <RadioGroupPrimitive.Root {...props}>
      {props.children}
    </RadioGroupPrimitive.Root>
  )
}

const RadioItem = (props: ComponentProps<typeof StyledRadioItem>) => {
  return (
    <StyledRadioItem {...props}>
      <StyledIndicator />
    </StyledRadioItem>
  )
}

const StyledRadioItem = styled(RadioGroupPrimitive.Item)`
  all: unset;
  background-color: white;
  width: 22px;
  height: 22px;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: 100%;
`

const StyledIndicator = styled(RadioGroupPrimitive.Indicator)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: relative;

  &::after {
    content: "";
    display: block;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.colors.primary};
  }
`

RadioGroup.Item = RadioItem

export { RadioGroup }
