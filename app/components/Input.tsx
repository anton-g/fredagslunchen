import styled from "styled-components"

const Input = styled.input`
  color: ${({ theme }) => theme.colors.primary};
  background-color: ${({ theme }) => theme.colors.secondary};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: 4px;
  position: relative;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  font-size: 16px;
  padding: 6px 8px;
  margin: 0;
  width: 100%;
  font-family: Inter, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu,
    Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
`

export { Input }
