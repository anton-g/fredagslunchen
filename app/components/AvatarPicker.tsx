import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import type { RecursivelyConvertDatesToStrings } from "~/utils"
import type { ComponentProps } from "react"
import type { User } from "~/models/user.server"
import { useRef } from "react"
import { useFetcher } from "@remix-run/react"
import styled from "styled-components"
import { Avatar, UserAvatar } from "~/components/Avatar"
import { LinkButton } from "~/components/Button"
import { RadioGroup } from "~/components/RadioGroup"
import { Spacer } from "~/components/Spacer"
import { Stack } from "~/components/Stack"
import { useFeatureFlags } from "~/FeatureFlagContext"

export const AvatarPicker = ({ user }: { user: RecursivelyConvertDatesToStrings<User> }) => {
  const fetcher = useFetcher()
  const { current: initialAvatar } = useRef(user.avatarId)
  const { current: avatars } = useRef(
    [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
      29, 30,
    ].filter((x) => x !== user.avatarId)
  )

  const { premium } = useFeatureFlags()
  if (!premium) return null

  const hasPremium = false
  if (hasPremium) {
    return (
      <>
        <fetcher.Form method="post" onChange={(e) => fetcher.submit(e.currentTarget, { replace: true })}>
          <input type="hidden" name="action" value="updateAvatar" />
          <AvatarRadioGroup defaultValue={`${initialAvatar}`} name="avatar">
            <AvatarScrollArea axis="horizontal" gap={16}>
              <AvatarRadio variant={initialAvatar || 1} value={`${initialAvatar}`} />
              {avatars.map((variant) => (
                <AvatarRadio key={variant} variant={variant} value={`${variant}`} />
              ))}
            </AvatarScrollArea>
          </AvatarRadioGroup>
        </fetcher.Form>
        <Spacer size={24} />
      </>
    )
  }

  return (
    <>
      <Stack axis="horizontal" gap={10}>
        <UserAvatar user={user} />
        <Stack
          axis="horizontal"
          gap={16}
          style={{
            position: "relative",
            paddingLeft: 6,
            paddingBottom: 6,
            overflow: "hidden",
          }}
        >
          <AvatarPremiumCTA />
          <Avatar variant={2} size="medium" />
          <Avatar variant={17} size="medium" />
          <Avatar variant={24} size="medium" />
          <Avatar variant={24} size="medium" />
          <Avatar variant={12} size="medium" />
          <Avatar variant={19} size="medium" />
          <Avatar variant={23} size="medium" />
          <Avatar variant={16} size="medium" />
          <Avatar variant={16} size="medium" />
          <Avatar variant={16} size="medium" />
        </Stack>
      </Stack>
      <Spacer size={24} />
    </>
  )
}
const AvatarPremiumCTA = () => {
  return (
    <PremiumWrapper>
      <Backdrop />
      <LinkButton to="/supporter" size="normal">
        Unlock more avatars
      </LinkButton>
    </PremiumWrapper>
  )
}
const PremiumWrapper = styled.div`
  position: absolute;
  font-weight: bold;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  inset: 0;
  /* inset: -8px -8px -16px -8px; */
  ::after {
    content: "";
    position: absolute;
    background: transparent;
    background: linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, ${({ theme }) => theme.colors.secondary} 70%);
    width: 96px;
    height: 100%;
    right: 0;
  }
`
const Backdrop = styled.div`
  position: absolute;
  inset: 0;
  background-color: ${({ theme }) => theme.colors.secondary};
  opacity: 0.7;
  z-index: -1;
`
const AvatarRadio = (props: ComponentProps<typeof RadioGroupPrimitive.Item> & { variant: number }) => {
  return (
    <AvatarRadioItem {...props}>
      <AvatarFoo variant={props.variant} size="medium" />
    </AvatarRadioItem>
  )
}
const AvatarRadioGroup = styled(RadioGroup)`
  position: relative;
  margin: 0 -20px;

  ::after {
    content: "";
    position: absolute;
    background: transparent;
    background: linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, ${({ theme }) => theme.colors.secondary} 70%);
    width: 32px;
    height: 100%;
    top: 0;
    right: 0;
  }

  ::before {
    content: "";
    position: absolute;
    background: transparent;

    background: linear-gradient(90deg, ${({ theme }) => theme.colors.secondary} 0%, rgba(255, 0, 0, 0) 70%);
    width: 32px;
    height: 100%;
    top: 0;
    left: 0;
  }
`
const AvatarScrollArea = styled(Stack)`
  max-width: 100%;
  padding: 0 20px;
  padding-bottom: 6px;
  overflow-x: scroll;
`
const AvatarFoo = styled(Avatar)`
  cursor: pointer;
  box-shadow: 0px 0px 0px 0px ${({ theme }) => theme.colors.primary};
  &:hover {
    box-shadow: -3px 3px 0px 0px ${({ theme }) => theme.colors.primary};
  }

  transition: box-shadow 100ms ease-in-out;
`
const AvatarRadioItem = styled(RadioGroupPrimitive.Item)`
  all: unset;

  &[data-state="checked"] ${AvatarFoo} {
    box-shadow: -5px 5px 0px 0px ${({ theme }) => theme.colors.primary};
  }
`
