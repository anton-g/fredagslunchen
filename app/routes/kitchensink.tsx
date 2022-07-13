import { CubeIcon, RocketIcon } from "@radix-ui/react-icons";
import type { MetaFunction } from "@remix-run/node";
import type { FC } from "react";
import { Button } from "~/components/Button";
import { Spacer } from "~/components/Spacer";
import { Stack } from "~/components/Stack";

export const meta: MetaFunction = () => {
  return {
    title: "Kitchensink",
  };
};

export default function Join() {
  return (
    <Stack gap={24}>
      <Component title="Button">
        <Stack gap={24} axis="horizontal">
          <Button>Normal</Button>
          <Button>
            With icon
            <Spacer size={4} />
            <RocketIcon />
          </Button>
          <Button variant="round">
            <CubeIcon />
          </Button>
        </Stack>
      </Component>
      <Component title="Stack (vertical)">
        <Stack gap={8}>
          <div
            style={{ width: 100, height: 50, backgroundColor: "darkgray" }}
          ></div>
          <div
            style={{ width: 100, height: 50, backgroundColor: "darkgray" }}
          ></div>
          <div
            style={{ width: 100, height: 50, backgroundColor: "darkgray" }}
          ></div>
        </Stack>
      </Component>
      <Component title="Stack (horizontal)">
        <Stack gap={8} axis="horizontal">
          <div
            style={{ width: 100, height: 50, backgroundColor: "darkgray" }}
          ></div>
          <div
            style={{ width: 100, height: 50, backgroundColor: "darkgray" }}
          ></div>
          <div
            style={{ width: 100, height: 50, backgroundColor: "darkgray" }}
          ></div>
        </Stack>
      </Component>
    </Stack>
  );
}

const Component: FC<{ title: string }> = ({ title, children }) => {
  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  );
};
