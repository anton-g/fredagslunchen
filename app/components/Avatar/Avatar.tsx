import styled, { css } from "styled-components"
import type { User } from "~/models/user.server"
import { hashStr } from "~/utils"
import { Card } from "../Card"
import { faces } from "./faces"

type AvatarSize = "tiny" | "small" | "medium" | "large"

type AvatarProps = {
  variant: number
  size?: AvatarSize
  className?: string
}
export const Avatar = ({ variant, className, size = "large" }: AvatarProps) => {
  const Face = faces[variant - 1]

  return (
    <Wrapper size={size} className={className}>
      {Face}
    </Wrapper>
  )
}

const sizes: Record<AvatarSize, number> = {
  large: 100,
  medium: 60,
  small: 40,
  tiny: 30,
}

const Wrapper = styled(Card)<{ size: AvatarSize }>`
  width: ${({ size }) => sizes[size]}px;
  height: ${({ size }) => sizes[size]}px;
  min-width: ${({ size }) => sizes[size]}px;
  min-height: ${({ size }) => sizes[size]}px;
  max-width: ${({ size }) => sizes[size]}px;
  max-height: ${({ size }) => sizes[size]}px;
  ${({ size, theme }) =>
    size === "tiny" &&
    css`
      box-shadow: -2px 2px 0px 0px ${theme.colors.primary};
    `}
  padding: 0;
  border-color: ${({ theme }) => theme.colors.avatarForeground};

  svg {
    height: 100%;
    width: 100%;
    background-color: ${({ theme }) => theme.colors.avatarBackground};
    color: ${({ theme }) => theme.colors.avatarForeground};
  }
`

export const RandomAvatar = ({ size = "large" }: Omit<AvatarProps, "variant">) => {
  const variant = Math.floor(Math.random() * 12) + 1

  return <Avatar size={size} variant={variant}></Avatar>
}

const availableFaces = 30
export const SeedAvatar = ({ size = "medium", seed }: Omit<AvatarProps, "variant"> & { seed: string }) => {
  const hash = hashStr(seed)
  const variant = (hash % availableFaces) + 1

  return <Avatar size={size} variant={variant}></Avatar>
}

export const UserAvatar = ({
  user,
  size = "medium",
}: Omit<AvatarProps, "variant"> & {
  user: Pick<User, "avatarId">
}) => {
  return <Avatar variant={user.avatarId} size={size} />
}
