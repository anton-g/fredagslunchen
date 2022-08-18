import { createGlobalStyle } from "styled-components"

export default createGlobalStyle`
  html,
  body {
    padding: 0;
    margin: 0;
    font-family: Inter, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans,
      Helvetica Neue, sans-serif;
    height: 100%;
    background: ${({ theme }) => theme.colors.secondary};
    color: ${({ theme }) => theme.colors.primary};
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
