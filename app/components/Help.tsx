import type { ReactNode } from "react"
import styled from "styled-components"
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons"
import { Popover } from "./Popover"

export function Help({ children }: { children: ReactNode }) {
  return (
    <Popover>
      <Popover.Trigger asChild>
        <Icon>
          <QuestionMarkCircledIcon />
        </Icon>
      </Popover.Trigger>
      <Content>{children}</Content>
    </Popover>
  )
}

const Icon = styled.button`
  padding: 0;
  margin: 0;
  background: none;
  border: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.primary};

  svg {
    width: 20px;
    height: 20px;
  }
`

const Content = styled(Popover.Content)`
  margin: 0 8px;

  p {
    margin: 0;

    &:not(:first-child) {
      margin-top: 12px;
    }
  }
`
