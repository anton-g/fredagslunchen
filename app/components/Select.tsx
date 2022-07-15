import type { ReactNode } from "react";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@radix-ui/react-icons";
import * as SelectPrimitive from "@radix-ui/react-select";
import styled, { css } from "styled-components";

type SelectProps = {
  defaultValue?: string;
  children: ReactNode;
};

const Select = ({ defaultValue, children }: SelectProps) => (
  <SelectPrimitive.Root defaultValue={defaultValue}>
    <SelectTrigger aria-label="Food">
      <SelectValue />
      <SelectIcon>
        <ChevronDownIcon />
      </SelectIcon>
    </SelectTrigger>
    <SelectContent>
      <SelectScrollUpButton>
        <ChevronUpIcon />
      </SelectScrollUpButton>
      <SelectViewport>{children}</SelectViewport>
      <SelectScrollDownButton>
        <ChevronDownIcon />
      </SelectScrollDownButton>
    </SelectContent>
  </SelectPrimitive.Root>
);

const StyledTrigger = styled(SelectPrimitive.SelectTrigger)`
  all: unset;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  border: 2px solid black;
  padding: 0 15px;
  font-size: 16px;
  line-height: 1px;
  height: 35px;
  gap: 5px;
  background-color: white;
  color: black;
`;

const StyledContent = styled(SelectPrimitive.Content)`
  overflow: hidden;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0px 10px 38px -10px rgba(22, 23, 24, 0.35),
    0px 10px 20px -15px rgba(22, 23, 24, 0.2);
`;

const StyledViewport = styled(SelectPrimitive.Viewport)`
  padding: 5px;
`;

const StyledItem = styled(SelectPrimitive.Item)`
  all: unset;
  font-size: 16px;
  line-height: 1px;
  color: black;
  border-radius: 3px;
  display: flex;
  align-items: center;
  height: 25px;
  padding: 0 35px 0 25px;
  position: relative;
  user-select: none;
  &[data-disabled] {
    text-decoration: line-through;
    pointer-events: none;
  }
  &:focus {
    background-color: black;
    color: white;
  }
`;

const StyledLabel = styled(SelectPrimitive.Label)`
  padding: 0 25px;
  font-size: 14px;
  line-height: 25px;
  text-decoration: underline;
  color: black;
`;

const StyledSeparator = styled(SelectPrimitive.Separator)`
  height: 1px;
  background-color: black;
  margin: 5px;
`;

const StyledItemIndicator = styled(SelectPrimitive.ItemIndicator)`
  position: absolute;
  left: 0px;
  width: 25px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const scrollButtonStyles = css`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 25px;
  background-color: white;
  color: black;
  cursor: default;
`;

const StyledScrollUpButton = styled(SelectPrimitive.ScrollUpButton)`
  ${scrollButtonStyles}
`;

const StyledScrollDownButton = styled(SelectPrimitive.ScrollDownButton)`
  ${scrollButtonStyles}
`;

const SelectTrigger = StyledTrigger;
const SelectValue = SelectPrimitive.Value;
const SelectIcon = SelectPrimitive.Icon;
const SelectContent = StyledContent;
const SelectViewport = StyledViewport;
const SelectGroup = SelectPrimitive.Group;
const SelectItem = StyledItem;
const SelectItemText = SelectPrimitive.ItemText;
const SelectItemIndicator = StyledItemIndicator;
const SelectLabel = StyledLabel;
const SelectSeparator = StyledSeparator;
const SelectScrollUpButton = StyledScrollUpButton;
const SelectScrollDownButton = StyledScrollDownButton;

const Indicator = () => {
  return (
    <SelectItemIndicator>
      <CheckIcon />
    </SelectItemIndicator>
  );
};

Select.Group = SelectGroup;
Select.Separator = SelectSeparator;
Select.Label = SelectLabel;
Select.Item = SelectItem;
Select.ItemText = SelectItemText;
Select.ItemIndicator = Indicator;

export { Select };
