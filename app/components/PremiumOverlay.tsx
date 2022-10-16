import * as React from "react"
import styled from "styled-components"
import { LinkButton } from "~/components/Button"
import { Spacer } from "~/components/Spacer"

export const PremiumOverlay = () => {
  return (
    <PremiumWrapper>
      <Backdrop />
      <h3>Support Fredagslunchen</h3>
      <Spacer size={8} />
      <p>Get access to exclusive themes, avatars and more!</p>
      <Spacer size={16} />
      <LinkButton to="/supporter" size="large">
        Become a supporter
      </LinkButton>
    </PremiumWrapper>
  )
}

const PremiumWrapper = styled.div`
  position: absolute;
  inset: -8px -8px -16px -8px;
  font-weight: bold;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  > h3 {
    margin: 0;
    font-size: 36px;
    padding: 4px 8px;
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.secondary};
  }

  > p {
    margin: 0;
    padding: 0 8px;
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.secondary};
    line-height: 1.5;
  }
`

const Backdrop = styled.div`
  position: absolute;
  inset: 0;
  background-color: ${({ theme }) => theme.colors.secondary};
  opacity: 0.5;
  z-index: -1;
`
