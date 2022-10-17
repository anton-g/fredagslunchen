import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import type { ActionFunction, LoaderArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import {
  Form,
  useActionData,
  useFetcher,
  useLoaderData,
} from "@remix-run/react"
import * as React from "react"
import styled, { css } from "styled-components"
import invariant from "tiny-invariant"
import { Avatar, UserAvatar } from "~/components/Avatar"
import { Button, LinkButton } from "~/components/Button"
import { Card } from "~/components/Card"
import { Input } from "~/components/Input"
import { RadioGroup } from "~/components/RadioGroup"
import { Spacer } from "~/components/Spacer"
import { PremiumOverlay } from "~/components/PremiumOverlay"
import { Stack } from "~/components/Stack"
import { useFeatureFlags } from "~/FeatureFlagContext"
import type { User } from "~/models/user.server"
import {
  changeUserPassword,
  checkIsAdmin,
  getFullUserById,
  updateUser,
} from "~/models/user.server"

import { requireUserId } from "~/session.server"
import { availableThemes, useThemeContext } from "~/styles/theme"
import { RecursivelyConvertDatesToStrings } from "~/utils"
import { ComponentProps } from "react"

export const loader = async ({ request, params }: LoaderArgs) => {
  const currentUserId = await requireUserId(request)
  invariant(params.userId, "userId is required")

  const isAdmin = checkIsAdmin(currentUserId)

  if (currentUserId !== params.userId && !isAdmin) {
    throw new Response("Not Found", { status: 404 })
  }

  const user = await getFullUserById({
    id: params.userId,
    requestUserId: currentUserId,
  })

  if (!user) {
    throw new Response("Not Found", { status: 404 })
  }

  return json({
    user,
  })
}

type ActionData = {
  errors?: {
    name?: string
    password?: string
    newPassword?: string
    theme?: string
  }
}

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request)
  invariant(params.userId, "userId not found")

  if (userId !== params.userId) {
    throw new Response("Bad Request", { status: 400 })
  }

  const formData = await request.formData()

  const theme = formData.get("theme")
  if (theme) {
    if (typeof theme !== "string" || theme.length === 0) {
      return json<ActionData>(
        { errors: { theme: "Invalid theme" } },
        { status: 400 }
      )
    }

    await updateUser({
      id: userId,
      theme,
    })

    return json({ ok: true })
  }

  const password = formData.get("current-password")
  if (password) {
    // todo move to func
    const newPassword = formData.get("new-password")

    if (typeof password !== "string" || password.length === 0) {
      return json<ActionData>(
        { errors: { password: "Current password is required" } },
        { status: 400 }
      )
    }

    if (typeof newPassword !== "string" || newPassword.length === 0) {
      return json<ActionData>(
        { errors: { newPassword: "New password is required" } },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return json<ActionData>(
        { errors: { newPassword: "Password is too short" } },
        { status: 400 }
      )
    }

    const userOrError = await changeUserPassword({
      id: userId,
      oldPassword: password,
      newPassword,
    })

    if ("error" in userOrError) {
      return json<ActionData>(
        { errors: { password: userOrError.error } },
        { status: 400 }
      )
    }

    return redirect(`/users/${userOrError.id}`)
  }

  const name = formData.get("name")

  if (typeof name !== "string" || name.length === 0) {
    return json<ActionData>(
      { errors: { name: "Name is required" } },
      { status: 400 }
    )
  }

  const user = await updateUser({
    id: userId,
    name,
  })

  return redirect(`/users/${user.id}`)
}

export default function UserSettingsPage() {
  const { user } = useLoaderData<typeof loader>()
  const actionData = useActionData() as ActionData
  const nameRef = React.useRef<HTMLInputElement>(null)
  const currentPasswordRef = React.useRef<HTMLInputElement>(null)
  const newPasswordRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (actionData?.errors?.name) {
      nameRef.current?.focus()
    }
  }, [actionData])

  return (
    <div>
      <Title>Your settings</Title>
      <AvatarPicker user={user} />
      <Form method="post">
        <Stack gap={16}>
          <div>
            <label htmlFor="name">Name</label>
            <div>
              <Input
                ref={nameRef}
                id="name"
                required
                name="name"
                type="name"
                autoComplete="name"
                defaultValue={user.name}
                aria-invalid={actionData?.errors?.name ? true : undefined}
                aria-describedby="name-error"
              />
              {actionData?.errors?.name && (
                <div id="name-error">{actionData.errors.name}</div>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <div>
              <Input
                // ref={emailRef}
                // id="email"
                required
                // name="email"
                type="email"
                disabled
                defaultValue={user.email?.email}
                // aria-invalid={actionData?.errors?.name ? true : undefined}
                // aria-describedby="name-error"
              />
              {/* {actionData?.errors?.name && (
              <div id="name-error">{actionData.errors.name}</div>
            )} */}
            </div>
          </div>
        </Stack>
        <Spacer size={16} />
        <Button style={{ marginLeft: "auto" }}>Save changes</Button>
      </Form>
      <Form method="post">
        <Subtitle>Change password</Subtitle>
        <Stack gap={16}>
          <div>
            <label htmlFor="current-password">Current password</label>
            <div>
              <Input
                id="current-password"
                ref={currentPasswordRef}
                name="current-password"
                type="password"
                aria-invalid={actionData?.errors?.password ? true : undefined}
                aria-describedby="current-password-error"
              />
              {actionData?.errors?.password && (
                <div id="current-password-error">
                  {actionData.errors.password}
                </div>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="new-password">New password</label>
            <div>
              <Input
                id="new-password"
                ref={newPasswordRef}
                name="new-password"
                minLength={8}
                type="password"
                aria-invalid={
                  actionData?.errors?.newPassword ? true : undefined
                }
                aria-describedby="new-password-error"
              />
              {actionData?.errors?.newPassword && (
                <div id="new-password-error">
                  {actionData.errors.newPassword}
                </div>
              )}
            </div>
          </div>
          <Button style={{ marginLeft: "auto" }}>Change password</Button>
        </Stack>
      </Form>
      <ThemePicker />
    </div>
  )
}

const Title = styled.h2`
  font-size: 48px;
  margin: 0;
  margin-bottom: 24px;
`

const Subtitle = styled.h3`
  font-size: 24px;
  margin: 16px 0;
`

const ColorStack = styled(Stack)`
  align-items: center;

  > *:first-child {
    margin-bottom: -16px;
  }

  > *:nth-child(2) {
    margin-left: -16px;
    margin-top: -16px;
  }
`

const ColorTitle = styled.h2`
  margin-left: auto;
`

const RadioItemCard = ({
  children,
  style,
  ...props
}: React.ComponentProps<typeof RadioGroup.Item>) => {
  return (
    <Wrapper style={style}>
      <Content>{children}</Content>
      <Spacer size={24} />
      <RadioGroup.Item {...props} />
    </Wrapper>
  )
}

const Wrapper = styled.label`
  ${({ theme }) =>
    css`
      background-color: ${theme.colors.secondary};
      color: ${theme.colors.primary};
      border: 2px solid ${theme.colors.primary};
      box-shadow: -5px 5px 0px 0px ${theme.colors.primary};
    `}

  border-radius: 8px;
  padding: 16px 24px;
  overflow: hidden;
  display: flex;
  align-items: center;
`

const Content = styled.div`
  flex-grow: 1;
`

const Color = styled(Card)<{ color: string }>`
  padding: 0;
  background-color: ${({ color }) => color};
  width: 40px;
  height: 40px;
  box-shadow: none;
`

const ThemePicker = () => {
  const { premium } = useFeatureFlags()
  const { theme, setTheme } = useThemeContext()
  const fetcher = useFetcher()

  const themes = Object.entries(availableThemes).map(([key, val]) => ({
    key,
    name: val.name,
    primary: val.colors.primary,
    secondary: val.colors.secondary,
    premium: val.premium,
  }))

  return (
    <fetcher.Form
      method="post"
      onChange={(e) => fetcher.submit(e.currentTarget, { replace: true })}
    >
      <Subtitle>Theme</Subtitle>
      <RadioGroup
        defaultValue={theme}
        onValueChange={(theme: any) => setTheme(theme)}
        name="theme"
      >
        <Stack gap={16}>
          {themes
            .filter((t) => !t.premium)
            .map((t) => (
              <RadioItemCard value={t.key} id={t.key} key={t.key}>
                <ColorStack gap={0} axis="horizontal">
                  <Color color={t.secondary} />
                  <Color color={t.primary} />
                  <ColorTitle>{t.name}</ColorTitle>
                </ColorStack>
              </RadioItemCard>
            ))}
        </Stack>
        {premium && (
          <>
            <Spacer size={16} />
            <Stack gap={16} style={{ position: "relative" }}>
              <PremiumOverlay />
              {themes
                .filter((t) => t.premium)
                .map((t, i) => (
                  <RadioItemCard
                    value={t.key}
                    id={t.key}
                    key={t.key}
                    disabled
                    style={{
                      userSelect: "none",
                      marginTop: i === 0 ? 0 : i * 0.9 * -32,
                      zIndex: -i,
                      transform: `scale(${1 - i * 0.07})`,
                      filter: `blur(${2 + i * 0.4}px) grayscale(80%)`,
                    }}
                  >
                    <ColorStack gap={0} axis="horizontal">
                      <Color color={t.secondary} />
                      <Color color={t.primary} />
                      <ColorTitle>{t.name}</ColorTitle>
                    </ColorStack>
                  </RadioItemCard>
                ))}
            </Stack>
          </>
        )}
      </RadioGroup>
    </fetcher.Form>
  )
}

const AvatarPicker = ({
  user,
}: {
  user: RecursivelyConvertDatesToStrings<User>
}) => {
  const { premium } = useFeatureFlags()
  if (!premium) return null

  const avatars = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 28, 29, 30,
  ].filter((x) => x !== user.avatarId)

  const hasPremium = true
  if (hasPremium) {
    return (
      <>
        <AvatarRadioGroup defaultValue={`${user.avatarId}`}>
          <AvatarScrollArea axis="horizontal" gap={16}>
            <AvatarRadio
              variant={user.avatarId || 1}
              value={`${user.avatarId}`}
            />
            {avatars.map((variant) => (
              <AvatarRadio
                key={variant}
                variant={variant}
                value={`${variant}`}
              />
            ))}
          </AvatarScrollArea>
        </AvatarRadioGroup>
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
    background: linear-gradient(
      90deg,
      rgba(0, 0, 0, 0) 0%,
      ${({ theme }) => theme.colors.secondary} 70%
    );
    width: 32px;
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

const AvatarRadio = (
  props: ComponentProps<typeof RadioGroupPrimitive.Item> & { variant: number }
) => {
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
    background: linear-gradient(
      90deg,
      rgba(0, 0, 0, 0) 0%,
      ${({ theme }) => theme.colors.secondary} 70%
    );
    width: 32px;
    height: 100%;
    top: 0;
    right: 0;
  }

  ::before {
    content: "";
    position: absolute;
    background: transparent;

    background: linear-gradient(
      90deg,
      ${({ theme }) => theme.colors.secondary} 0%,
      rgba(255, 0, 0, 0) 70%
    );
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
