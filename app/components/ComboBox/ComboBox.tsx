import * as React from "react";
import styled from "styled-components";
import type { ComboBoxProps } from "@react-types/combobox";

import { ListBox } from "./ListBox";
import { Popover } from "./Popover";
import { useFilter } from "@react-aria/i18n";
import { useComboBoxState } from "@react-stately/combobox";
import { useComboBox } from "@react-aria/combobox";
import { useButton } from "@react-aria/button";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { Wrapper, Label } from "./shared";

export { Item, Section } from "@react-stately/collections";

interface StyleProps {
  isFocused?: boolean;
  isOpen?: boolean;
}

const InputGroup = styled.div<StyleProps>`
  position: relative;
  display: inline-flex;
  flex-direction: row;
  overflow: hidden;
  margin-top: 4px;
  border-radius: 4px;
  box-shadow: ${(props) =>
    props.isFocused ? "0 0 0 3px rgba(143, 188, 143, 0.5)" : ""};
`;

const Input = styled.input<StyleProps>`
  appearance: none;
  border: none;
  padding: 6px 8px;
  outline: none;
  font-size: 16px;
  border: 2px solid;
  border-right: none;
  border-color: ${(props) => (props.isFocused ? "red" : "black")};
  border-radius: 4px 0 0 4px;
  margin: 0;
`;

const Button = styled.button`
  appearance: none;
  border: none;
  background: black;
  color: white;
  margin: 0;
`;

export function ComboBox<T extends object>(props: ComboBoxProps<T>) {
  let { contains } = useFilter({ sensitivity: "base" });
  let state = useComboBoxState({ ...props, defaultFilter: contains });

  let buttonRef = React.useRef(null);
  let inputRef = React.useRef(null);
  let listBoxRef = React.useRef(null);
  let popoverRef = React.useRef(null);

  let {
    buttonProps: triggerProps,
    inputProps,
    listBoxProps,
    labelProps,
  } = useComboBox(
    {
      ...props,
      inputRef,
      buttonRef,
      listBoxRef,
      popoverRef,
    },
    state
  );

  let { buttonProps } = useButton(triggerProps, buttonRef);

  return (
    <Wrapper>
      <Label {...labelProps}>{props.label}</Label>
      <InputGroup isFocused={state.isFocused}>
        <Input {...inputProps} ref={inputRef} isFocused={state.isFocused} />
        <Button {...buttonProps} ref={buttonRef}>
          <ChevronDownIcon
            style={{ width: 18, height: 18 }}
            aria-hidden="true"
          />
        </Button>
      </InputGroup>
      {state.isOpen && (
        <Popover
          popoverRef={popoverRef}
          isOpen={state.isOpen}
          onClose={state.close}
        >
          <ListBox {...listBoxProps} listBoxRef={listBoxRef} state={state} />
        </Popover>
      )}
    </Wrapper>
  );
}
