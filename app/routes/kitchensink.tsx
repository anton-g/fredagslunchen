import { CubeIcon, RocketIcon } from "@radix-ui/react-icons";
import type { MetaFunction } from "@remix-run/node";
import type { FC } from "react";
import { Button } from "~/components/Button";
import { Card } from "~/components/Card";
import { Checkbox } from "~/components/Checkbox";
import { Input } from "~/components/Input";
import { Spacer } from "~/components/Spacer";
import { Stack } from "~/components/Stack";

export const meta: MetaFunction = () => {
  return {
    title: "Kitchensink",
  };
};

export default function Join() {
  return (
    <div style={{ padding: 24 }}>
      <Stack gap={24}>
        <Component title="Card">
          <Stack gap={24} axis="horizontal">
            <Card>
              Hello hello hello hello <br />
              Hello hello hello hello hello hello <br />
              hello hello
            </Card>
            <Card variant="inverted">
              Hello hello hello hello <br />
              Hello hello hello hello hello hello <br />
              hello hello
            </Card>
          </Stack>
        </Component>
        <Component title="Checkbox">
          <Stack gap={24} axis="horizontal">
            <Checkbox />
            <Checkbox defaultChecked />
          </Stack>
        </Component>
        <Component title="Input">
          <Stack gap={24} axis="horizontal">
            <Input type="text" />
          </Stack>
        </Component>
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
        <Component title="Stack">
          <Stack gap={36} axis="horizontal">
            <Stack gap={8}>
              <div
                style={{ width: 100, height: 50, backgroundColor: "black" }}
              ></div>
              <div
                style={{ width: 100, height: 50, backgroundColor: "black" }}
              ></div>
              <div
                style={{ width: 100, height: 50, backgroundColor: "black" }}
              ></div>
            </Stack>
            <Stack gap={8} axis="horizontal">
              <div
                style={{ width: 100, height: 50, backgroundColor: "black" }}
              ></div>
              <div
                style={{ width: 100, height: 50, backgroundColor: "black" }}
              ></div>
              <div
                style={{ width: 100, height: 50, backgroundColor: "black" }}
              ></div>
            </Stack>
          </Stack>
        </Component>
      </Stack>
    </div>
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
