import { CubeIcon, RocketIcon } from "@radix-ui/react-icons";
import type { MetaFunction } from "@remix-run/node";
import type { FC } from "react";
import { Link as RemixLink } from "@remix-run/react";
import { Button, Link } from "~/components/Button";
import { Card } from "~/components/Card";
import { Checkbox } from "~/components/Checkbox";
import { Input } from "~/components/Input";
import { Spacer } from "~/components/Spacer";
import { Stack } from "~/components/Stack";
import { Table } from "~/components/Table";
import { Avatar, RandomAvatar, SeedAvatar } from "~/components/Avatar";

export const meta: MetaFunction = () => {
  return {
    title: "Kitchensink",
  };
};

export default function Join() {
  return (
    <div style={{ padding: 24 }}>
      <Stack gap={24}>
        <Component title="Avatar">
          <Stack gap={24} axis={"horizontal"}>
            <Avatar variant={5} />
            <Avatar variant={5} size="medium" />
            <Avatar variant={5} size="small" />
            <RandomAvatar />
            <SeedAvatar seed={"BassLabb"} />
            <SeedAvatar seed={"Tessan"} />
          </Stack>
        </Component>
        <Component title="Table">
          <Table>
            <Table.Head>
              <tr>
                <Table.Heading>Date</Table.Heading>
                <Table.Heading>Location</Table.Heading>
                <Table.Heading numeric>Score</Table.Heading>
                <Table.Heading>Comment</Table.Heading>
              </tr>
            </Table.Head>
            <tbody>
              <tr>
                <Table.Cell>Last Friday</Table.Cell>
                <Table.Cell>
                  <RemixLink to="/kitchensink">Franzén</RemixLink>
                </Table.Cell>
                <Table.Cell numeric>3</Table.Cell>
                <Table.Cell>Very bad</Table.Cell>
              </tr>
              <tr>
                <Table.Cell>2022-04-02</Table.Cell>
                <Table.Cell>
                  <RemixLink to="/kitchensink">WokHouse</RemixLink>
                </Table.Cell>
                <Table.Cell numeric>3</Table.Cell>
                <Table.Cell>The best restaurant in town</Table.Cell>
              </tr>
              <tr>
                <Table.Cell>2021-06-23</Table.Cell>
                <Table.Cell>
                  <RemixLink to="/kitchensink">Franzén</RemixLink>
                </Table.Cell>
                <Table.Cell numeric>3</Table.Cell>
                <Table.Cell>Meh :/</Table.Cell>
              </tr>
            </tbody>
          </Table>
        </Component>
        <Component title="Card">
          <Stack
            gap={24}
            axis="horizontal"
            style={{ alignItems: "flex-start" }}
          >
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
            <Card>
              <Card>
                <Card>
                  <Card>
                    <Card>
                      <Card>:)</Card>
                    </Card>
                  </Card>
                </Card>
              </Card>
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
            <Link to="/kitchensink">As link</Link>
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
