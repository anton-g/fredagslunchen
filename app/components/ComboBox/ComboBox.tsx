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
import { Input } from "../Input";
import { useRef } from "react";

export { Item, Section } from "@react-stately/collections";

export const ComboBox = <T extends object>(
  props: ComboBoxProps<T> & {
    inputRef?: React.MutableRefObject<HTMLInputElement>;
  }
) => {
  let { contains } = useFilter({ sensitivity: "base" });
  let state = useComboBoxState({ ...props, defaultFilter: contains });

  let buttonRef = useRef(null);
  let inputRef = useRef<HTMLInputElement>(null!);
  let listBoxRef = useRef(null);
  let popoverRef = useRef(null);

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
        <ComboBoxInput
          {...inputProps}
          ref={(node) => {
            if (!node) return;

            inputRef.current = node;
            if (props.inputRef) {
              props.inputRef.current = node;
            }
          }}
          isFocused={state.isFocused}
        />
        <input
          type="hidden"
          name={props.name + "-key"}
          value={state.selectedItem?.key}
        />
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
};

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
  /* box-shadow: ${(props) =>
    props.isFocused ? "0 0 0 3px rgba(143, 188, 143, 0.5)" : ""}; */
`;

const ComboBoxInput = styled(Input)<StyleProps>`
  outline: none;
  border-right: none;
  border-radius: 4px 0 0 4px;
`;

const Button = styled.button`
  appearance: none;
  border: none;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.secondary};
  margin: 0;
`;
