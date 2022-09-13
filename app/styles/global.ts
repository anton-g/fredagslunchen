import { createGlobalStyle } from "styled-components"

export default createGlobalStyle`
  :root {
    --color-primary: ${({ theme }) => theme.colors.primary};
    --color-secondary: ${({ theme }) => theme.colors.secondary};
  }

  html {
    margin: 0;
    min-height: 100%;
    height: 100%;

    @media screen and (min-width: 720px) {
      margin-left: calc(100vw - 100%);
      margin-right: 0;
    }
  }

  body {
    padding: 0;
    margin: 0;
    background: ${({ theme }) => theme.colors.secondary};
    color: ${({ theme }) => theme.colors.primary};
    min-height: 100%;
    height: 100%;
    font-family: Inter, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans,
      Helvetica Neue, sans-serif;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  * {
    box-sizing: border-box;
    
    ::selection {
      color: ${({ theme }) => theme.colors.secondary};
      background: ${({ theme }) => theme.colors.primary};
    }
  }

  svg {
    display: block;
    overflow: visible;
  }
`
