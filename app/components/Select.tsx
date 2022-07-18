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

const SelectTrigger = styled(SelectPrimitive.SelectTrigger)`
  all: unset;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  padding: 0 15px;
  font-size: 16px;
  line-height: 1px;
  height: 35px;
  gap: 5px;
  background-color: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.primary};
`;

const SelectContent = styled(SelectPrimitive.Content)`
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.secondary};
  border-radius: 6px;
  box-shadow: 0px 10px 38px -10px rgba(22, 23, 24, 0.35),
    0px 10px 20px -15px rgba(22, 23, 24, 0.2);
`;

const SelectViewport = styled(SelectPrimitive.Viewport)`
  padding: 5px;
`;

const SelectItem = styled(SelectPrimitive.Item)`
  all: unset;
  font-size: 16px;
  line-height: 1px;
  color: ${({ theme }) => theme.colors.primary};
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
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.secondary};
  }
`;

const SelectLabel = styled(SelectPrimitive.Label)`
  padding: 0 25px;
  font-size: 14px;
  line-height: 25px;
  text-decoration: underline;
  color: ${({ theme }) => theme.colors.primary};
`;

const SelectSeparator = styled(SelectPrimitive.Separator)`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.primary};
  margin: 5px;
`;

const SelectItemIndicator = styled(SelectPrimitive.ItemIndicator)`
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
  background-color: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.primary};
  cursor: default;
`;

const SelectScrollUpButton = styled(SelectPrimitive.ScrollUpButton)`
  ${scrollButtonStyles}
`;

const SelectScrollDownButton = styled(SelectPrimitive.ScrollDownButton)`
  ${scrollButtonStyles}
`;

const SelectValue = SelectPrimitive.Value;
const SelectIcon = SelectPrimitive.Icon;
const SelectGroup = SelectPrimitive.Group;
const SelectItemText = SelectPrimitive.ItemText;

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
