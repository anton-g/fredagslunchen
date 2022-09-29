import "styled-components"

type CustomColors = {
  primary: string
  secondary: string
}

declare module "styled-components" {
  export interface DefaultTheme {
    name: string
    colors: CustomColors
  }
}
