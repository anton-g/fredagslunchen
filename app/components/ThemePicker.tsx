import { useFetcher } from "@remix-run/react"
import * as React from "react"
import styled, { css } from "styled-components"
import { Card } from "~/components/Card"
import { RadioGroup } from "~/components/RadioGroup"
import { Spacer } from "~/components/Spacer"
import { PremiumOverlay } from "~/components/PremiumOverlay"
import { Stack } from "~/components/Stack"
import { useFeatureFlags } from "~/FeatureFlagContext"
import { availableThemes, useThemeContext } from "~/styles/theme"

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
  ${({ theme }) => css`
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
export const ThemePicker = () => {
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
      <input type="hidden" name="action" value="updateTheme" />
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

const Subtitle = styled.h3`
  font-size: 24px;
  margin: 16px 0;
`
