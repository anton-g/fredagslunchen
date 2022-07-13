import type { DefaultTheme } from "styled-components";

import { crimson } from "@radix-ui/colors";

// Remember to update styled.d.ts when adding/removing colors here.
const theme: DefaultTheme = {
  colors: {
    primary: "black",
    secondary: "white",
    accent: crimson.crimson11,
  },
};

export { theme };
