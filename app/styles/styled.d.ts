import "styled-components"

type CustomColors = {
  primary: string
  secondary: string
  accent: string
}

declare module "styled-components" {
  export interface DefaultTheme {
    colors: CustomColors
  }
}
