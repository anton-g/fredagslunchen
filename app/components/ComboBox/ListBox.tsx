import * as React from "react";
import styled from "styled-components";
import type { AriaListBoxOptions } from "@react-aria/listbox";
import { useListBox, useOption } from "@react-aria/listbox";
import type { Node } from "@react-types/shared";
import { CheckIcon } from "@radix-ui/react-icons";
import type { ListState } from "@react-stately/list";

interface ListBoxProps extends AriaListBoxOptions<unknown> {
  listBoxRef?: React.RefObject<HTMLUListElement>;
  state: ListState<unknown>;
}

interface OptionProps {
  item: Node<unknown>;
  state: ListState<unknown>;
}

const List = styled.ul`
  max-height: 300px;
  overflow: auto;
  list-style: none;
  padding: 0;
  margin: 4px 0;
  outline: none;
`;

interface ListItemProps {
  isFocused?: boolean;
  isSelected?: boolean;
}

const ListItem = styled.li<ListItemProps>`
  background: ${(props) => (props.isFocused ? "black" : "")};
  color: ${(props) =>
    props.isFocused ? "white" : props.isSelected ? "black" : "#333"};
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  font-size: 14px;
  font-weight: ${(props) => (props.isSelected ? "600" : "normal")};
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: default;
  outline: none;
`;

const ItemContent = styled.div`
  display: flex;
  align-items: center;
`;

export function ListBox(props: ListBoxProps) {
  let ref = React.useRef<HTMLUListElement>(null);
  let { listBoxRef = ref, state } = props;
  let { listBoxProps } = useListBox(props, state, listBoxRef);

  return (
    <List {...listBoxProps} ref={listBoxRef}>
      {[...state.collection].map((item) => (
        <Option key={item.key} item={item} state={state} />
      ))}
    </List>
  );
}

interface OptionContextValue {
  labelProps: React.HTMLAttributes<HTMLElement>;
  descriptionProps: React.HTMLAttributes<HTMLElement>;
}

const OptionContext = React.createContext<OptionContextValue>({
  labelProps: {},
  descriptionProps: {},
});

function Option({ item, state }: OptionProps) {
  let ref = React.useRef<HTMLLIElement>(null);
  let { optionProps, labelProps, descriptionProps, isSelected, isFocused } =
    useOption(
      {
        key: item.key,
      },
      state,
      ref
    );

  return (
    <ListItem
      {...optionProps}
      ref={ref}
      isFocused={isFocused}
      isSelected={isSelected}
    >
      <ItemContent>
        <OptionContext.Provider value={{ labelProps, descriptionProps }}>
          {item.rendered}
        </OptionContext.Provider>
      </ItemContent>
      {isSelected && (
        <CheckIcon aria-hidden="true" style={{ width: 18, height: 18 }} />
      )}
    </ListItem>
  );
}

// The Label and Description components will be used within an <Item>.
// They receive props from the OptionContext defined above.
// This ensures that the option is ARIA labelled by the label, and
// described by the description, which makes for better announcements
// for screen reader users.

export function Label({ children }: { children: React.ReactNode }) {
  let { labelProps } = React.useContext(OptionContext);
  return <div {...labelProps}>{children}</div>;
}

const StyledDescription = styled.div`
  font-weight: normal;
  font-size: 12px;
`;

export function Description({ children }: { children: React.ReactNode }) {
  let { descriptionProps } = React.useContext(OptionContext);
  return (
    <StyledDescription {...descriptionProps}>{children}</StyledDescription>
  );
}
