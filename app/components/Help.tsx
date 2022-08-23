import type { ReactNode } from "react"
import styled from "styled-components"
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons"
import { HoverCard } from "./HoverCard"

export function Help({ children }: { children: ReactNode }) {
  return (
    <HoverCard>
      <HoverCard.Trigger asChild>
        <Icon>
          <QuestionMarkCircledIcon />
        </Icon>
      </HoverCard.Trigger>
      <Content>{children}</Content>
    </HoverCard>
  )
}

const Icon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: help;

  svg {
    width: 20px;
    height: 20px;
  }
`

const Content = styled(HoverCard.Content)`
  max-width: 400px;

  p {
    margin: 0;

    &:not(:first-child) {
      margin-top: 12px;
    }
  }
`
