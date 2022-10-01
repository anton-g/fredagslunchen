import "styled-components"

type CustomColors = {
  primary: string
  secondary: string
  avatarForeground: string
  avatarBackground: string
}

declare module "styled-components" {
  export interface DefaultTheme {
    name: string
    colors: CustomColors
  }
}
