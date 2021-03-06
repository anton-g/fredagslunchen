import type { ComponentProps, FC } from "react";
import styled from "styled-components";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Cross2Icon } from "@radix-ui/react-icons";

const Checkbox: FC<ComponentProps<typeof StyledCheckbox>> = (props) => {
  return (
    <StyledCheckbox {...props}>
      <StyledIndicator>
        <Cross2Icon />
      </StyledIndicator>
    </StyledCheckbox>
  );
};

const StyledCheckbox = styled(CheckboxPrimitive.Root)`
  background-color: ${({ theme }) => theme.colors.secondary};
  width: 22px;
  height: 22px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${({ theme }) => theme.colors.primary};
`;

const StyledIndicator = styled(CheckboxPrimitive.Indicator)`
  color: ${({ theme }) => theme.colors.primary}; ;
`;

export { Checkbox };
