import { FocusScope } from "@react-aria/focus";
import { DismissButton, useOverlay } from "@react-aria/overlays";
import * as React from "react";
import styled from "styled-components";

interface PopoverProps {
  popoverRef?: React.RefObject<HTMLDivElement>;
  children: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
}

const Wrapper = styled.div`
  position: absolute;
  top: 100%;
  z-index: 1;
  width: 100%;
  border: 2px solid black;
  border-radius: 4px;
  margin-top: 6px;
  background: white;
`;

export function Popover(props: PopoverProps) {
  let ref = React.useRef<HTMLDivElement>(null);
  let { popoverRef = ref, isOpen, onClose, children } = props;

  // Handle events that should cause the popup to close,
  // e.g. blur, clicking outside, or pressing the escape key.
  let { overlayProps } = useOverlay(
    {
      isOpen,
      onClose,
      shouldCloseOnBlur: true,
      isDismissable: false,
    },
    popoverRef
  );

  // Add a hidden <DismissButton> component at the end of the popover
  // to allow screen reader users to dismiss the popup easily.
  return (
    <FocusScope restoreFocus>
      <Wrapper {...overlayProps} ref={popoverRef}>
        {children}
        <DismissButton onDismiss={onClose} />
      </Wrapper>
    </FocusScope>
  );
}
