import styled from "styled-components"
import { Card } from "./Card"

type AvatarSize = "small" | "medium" | "large"

type AvatarProps = {
  variant: number
  size?: AvatarSize
}
export const Avatar = ({ variant, size = "large" }: AvatarProps) => {
  return (
    <Wrapper size={size}>
      <img
        src={`/images/faces/${variant}.svg`}
        alt="black and white sketch of a face"
      ></img>
    </Wrapper>
  )
}

const sizes: Record<AvatarSize, number> = {
  large: 100,
  medium: 60,
  small: 40,
}

const Wrapper = styled(Card)<{ size: AvatarSize }>`
  max-width: ${({ size }) => sizes[size]}px;
  max-height: ${({ size }) => sizes[size]}px;
  padding: 0;

  img {
    height: 100%;
    width: 100%;
    background-color: white;
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
