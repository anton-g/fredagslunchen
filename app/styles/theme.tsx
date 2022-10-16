import type { ReactNode } from "react"
import { createContext, useState, useContext } from "react"
import type { DefaultTheme } from "styled-components"

// Remember to update styled.d.ts when adding/removing colors here.
const light: DefaultTheme = {
  name: "Light",
  premium: false,
  colors: {
    primary: "black",
    secondary: "white",
    avatarBackground: "white",
    avatarForeground: "black",
  },
}

const dark: DefaultTheme = {
  name: "Dark",
  premium: false,
  colors: {
    primary: "white",
    secondary: "black",
    avatarBackground: "white",
    avatarForeground: "black",
  },
}

const smorgasbord: DefaultTheme = {
  name: "Smörgåsbord",
  premium: true,
  colors: {
    primary: "#f2fa32",
    secondary: "#1560a0",
    avatarBackground: "#f2fa32",
    avatarForeground: "#1560a0",
  },
}

const fire: DefaultTheme = {
  name: "Fire in the Valley",
  premium: true,
  colors: {
    primary: "#f74052",
    secondary: "#0c0d26",
    avatarBackground: "#f74052",
    avatarForeground: "#0c0d26",
  },
}

const purpleRain: DefaultTheme = {
  name: "Purple Rain",
  premium: true,
  colors: {
    primary: "#a425d6",
    secondary: "#d2f4f7",
    avatarBackground: "#d2f4f7",
    avatarForeground: "#a425d6",
  },
}

const availableThemes = {
  light,
  dark,
  smorgasbord,
  purpleRain,
  fire,
  fire2: fire,
  fire3: fire,
  fire4: fire,
}

export const themeToMapStyle: Record<Theme, string> = {
  light: "mapbox://styles/mapbox/light-v10",
  dark: "mapbox://styles/mapbox/dark-v10",
  purpleRain: "mapbox://styles/mapbox/dark-v10",
  fire: "mapbox://styles/mapbox/dark-v10",
  fire2: "mapbox://styles/mapbox/dark-v10",
  fire3: "mapbox://styles/mapbox/dark-v10",
  fire4: "mapbox://styles/mapbox/dark-v10",
  smorgasbord: "mapbox://styles/mapbox/dark-v10",
}

export type Theme = keyof typeof availableThemes

const ThemeContext = createContext<{
  theme: Theme
  setTheme: (theme: Theme) => void
}>(null!)

function InternalThemeProvider({
  defaultTheme,
  children,
}: {
  defaultTheme: Theme
  children: ReactNode
}) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

const useThemeContext = () => useContext(ThemeContext)

export { availableThemes, InternalThemeProvider, useThemeContext }
