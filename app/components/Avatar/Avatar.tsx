import styled from "styled-components"
import { Card } from "../Card"
import { faces } from "./faces"

type AvatarSize = "small" | "medium" | "large"

type AvatarProps = {
  variant: number
  size?: AvatarSize
}
export const Avatar = ({ variant, size = "large" }: AvatarProps) => {
  const Face = faces[variant - 1]

  return <Wrapper size={size}>{Face}</Wrapper>
}

const sizes: Record<AvatarSize, number> = {
  large: 100,
  medium: 60,
  small: 40,
}

const Wrapper = styled(Card)<{ size: AvatarSize }>`
  width: ${({ size }) => sizes[size]}px;
  height: ${({ size }) => sizes[size]}px;
  min-width: ${({ size }) => sizes[size]}px;
  min-height: ${({ size }) => sizes[size]}px;
  max-width: ${({ size }) => sizes[size]}px;
  max-height: ${({ size }) => sizes[size]}px;
  padding: 0;
  border-color: ${({ theme }) => theme.colors.avatarForeground};

  svg {
    height: 100%;
    width: 100%;
    background-color: ${({ theme }) => theme.colors.avatarBackground};
    color: ${({ theme }) => theme.colors.avatarForeground};
  }
`

export const RandomAvatar = ({
  size = "large",
}: Omit<AvatarProps, "variant">) => {
  const variant = Math.floor(Math.random() * 12) + 1

  return <Avatar size={size} variant={variant}></Avatar>
}

const availableFaces = 30
export const SeedAvatar = ({
  size = "medium",
  seed,
}: Omit<AvatarProps, "variant"> & { seed: string }) => {
  const hash = hashStr(seed)
  const variant = (hash % availableFaces) + 1

  return <Avatar size={size} variant={variant}></Avatar>
}

function hashStr(str: string) {
  var hash = 0
  for (var i = 0; i < str.length; i++) {
    var charCode = str.charCodeAt(i)
    hash += charCode
  }
  return hash
}
