import styled from "styled-components";

const Input = styled.input`
  background-color: ${({ theme }) => theme.colors.secondary};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: 4px;
  position: relative;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  font-size: 16px;
  padding: 6px 8px;
  min-width: 175px;
  width: fit-content;
`;

export { Input };
