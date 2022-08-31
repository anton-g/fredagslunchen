import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Cross2Icon } from "@radix-ui/react-icons"
import type { ReactNode } from "react"
import styled from "styled-components"
import { Card } from "./Card"

const Dialog = ({
  children,
  ...props
}: { children: ReactNode } & DialogPrimitive.DialogProps) => (
  <DialogPrimitive.Root {...props}>{children}</DialogPrimitive.Root>
)

const DialogContent = ({ children }: { children: ReactNode }) => {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogContentWrapper>
        <Card>{children}</Card>
      </DialogContentWrapper>
    </DialogPrimitive.Portal>
  )
}

const DialogContentWrapper = styled(DialogPrimitive.Content)`
  color: ${({ theme }) => theme.colors.primary};
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  max-width: 450px;
  max-height: 85vh;
  z-index: 3;
`

const DialogOverlay = styled(DialogPrimitive.Overlay)`
  backdrop-filter: blur(4px);
  position: fixed;
  inset: 0;
  z-index: 2;
`

const DialogClose = () => {
  return (
    <DialogPrimitive.Close asChild>
      <CloseButton>
        <Cross2Icon />
      </CloseButton>
    </DialogPrimitive.Close>
  )
}

const CloseButton = styled.button`
  all: unset;
  font-family: inherit;
  border-radius: 100%;
  height: 25px;
  width: 25px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 10px;
  right: 10px;
  border: 2px solid transparent;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`

const DialogTitle = styled(DialogPrimitive.Title)`
  margin: 0;
`

Dialog.Trigger = DialogPrimitive.Trigger
Dialog.Content = DialogContent
Dialog.Title = DialogTitle
Dialog.Description = DialogPrimitive.Description
Dialog.Close = DialogClose

export { Dialog }
