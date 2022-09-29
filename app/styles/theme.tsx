import type { ReactNode } from "react"
import { createContext, useState, useContext } from "react"
import type { DefaultTheme } from "styled-components"

// Remember to update styled.d.ts when adding/removing colors here.
const light: DefaultTheme = {
  name: "Light",
  colors: {
    primary: "black",
    secondary: "white",
  },
}

const dark: DefaultTheme = {
  name: "Dark",
  colors: {
    primary: "white",
    secondary: "black",
  },
}

const smorgasbord: DefaultTheme = {
  name: "Smörgåsbord",
  colors: {
    primary: "gold",
    secondary: "dodgerblue",
  },
}

const availableThemes = {
  light,
  dark,
  // smorgasbord,
}

export const themeToMapStyle: Record<Theme, string> = {
  light: "mapbox://styles/mapbox/light-v10",
  dark: "mapbox://styles/mapbox/dark-v10",
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
