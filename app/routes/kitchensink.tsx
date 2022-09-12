import { CubeIcon, RocketIcon } from "@radix-ui/react-icons"
import type { LoaderArgs, MetaFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import type { FC } from "react"
import { Link, useLoaderData } from "@remix-run/react"
import { Button, LinkButton } from "~/components/Button"
import { Card } from "~/components/Card"
import { Checkbox } from "~/components/Checkbox"
import { Input } from "~/components/Input"
import { Spacer } from "~/components/Spacer"
import { Stack } from "~/components/Stack"
import { Table } from "~/components/Table"
import { Avatar, RandomAvatar, SeedAvatar } from "~/components/Avatar"
import { Switch, SwitchThumb } from "~/components/Switch"
import { Select } from "~/components/Select"
import { ComboBox, Item, Description, Label } from "~/components/ComboBox"
import { TextArea } from "~/components/TextArea"
import { HoverCard } from "~/components/HoverCard"
import { Map } from "~/components/Map"
import { Tooltip } from "~/components/Tooltip"
import { Dialog } from "~/components/Dialog"
import { getEnv } from "~/env.server"
import styled from "styled-components"
import { Help } from "~/components/Help"
import { Popover } from "~/components/Popover"

export const meta: MetaFunction = () => {
  return {
    title: "Kitchensink",
  }
}

export const loader = async ({ request }: LoaderArgs) => {
  return json({
    ENV: getEnv(),
  })
}

export default function Kitchensink() {
  const { ENV } = useLoaderData<typeof loader>()

  return (
    <div style={{ padding: 24 }}>
      <Stack gap={24}>
        <Component title="Popover">
          <Popover>
            <Popover.Trigger asChild>
              <Button>Click me</Button>
            </Popover.Trigger>
            <Popover.Content>Hello</Popover.Content>
          </Popover>
        </Component>
        <Component title="Hints">
          <Help>
            <p>Here's some helpful info!</p>
            <p>Here's some helpful info!</p>
          </Help>
        </Component>
        <Component title="Dialog">
          <Dialog>
            <Dialog.Trigger asChild>
              <Button>Trigger dialog</Button>
            </Dialog.Trigger>
            <Dialog.Content>
              <Dialog.Title>Title</Dialog.Title>
              <Dialog.Description>
                An automatically accessible description. You can write anything
                or nothing in here :)
              </Dialog.Description>
              <Dialog.Close />
            </Dialog.Content>
          </Dialog>
        </Component>
        <Component title="Tooltip">
          <Tooltip>
            <Tooltip.Trigger asChild>
              <Button>Hover me</Button>
            </Tooltip.Trigger>
            <Tooltip.Content>Example tooltip</Tooltip.Content>
          </Tooltip>
        </Component>
        <Component title="Map">
          {ENV.ENABLE_MAPS ? (
            <Map locations={locationsMock} />
          ) : (
            <span>Maps disabled</span>
          )}
        </Component>
        <Component title="Hover Card">
          <HoverCard>
            <HoverCard.Trigger asChild>
              <div
                style={{
                  width: "fit-content",
                  padding: 8,
                  border: "2px dashed black",
                }}
              >
                Hover me
              </div>
            </HoverCard.Trigger>
            <HoverCard.Content>Hello</HoverCard.Content>
          </HoverCard>
        </Component>
        <Component title="ComboBox">
          <ComboBoxExample />
        </Component>
        <Component title="Select">
          <SelectExample />
        </Component>
        <Component title="Switch">
          <Stack gap={24} axis={"horizontal"}>
            <Switch>
              <SwitchThumb />
            </Switch>
            <Switch defaultChecked>
              <SwitchThumb />
            </Switch>
          </Stack>
        </Component>
        <Component title="Avatar">
          <Stack gap={24} axis={"horizontal"}>
            <Avatar variant={1} />
            <Avatar variant={2} size="medium" />
            <Avatar variant={3} size="small" />
            <RandomAvatar />
            <SeedAvatar seed={"BassLabb"} />
            <SeedAvatar seed={"Tessan"} />
          </Stack>
        </Component>
        <Component title="Table">
          <TableExample />
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
        <Component title="TextArea">
          <Stack gap={24} axis="horizontal">
            <TextArea />
          </Stack>
        </Component>
        <Component title="Input">
          <Stack gap={24} axis="horizontal">
            <Input type="text" defaultValue="Basic input" />
            <Input type="date" />
            <Input type="number" defaultValue="5" />
            <Input disabled defaultValue="Disabled input" />
          </Stack>
        </Component>
        <Component title="Button">
          <Stack gap={24} axis="horizontal">
            <Button>Normal</Button>
            <Button disabled>Disabled</Button>
            <Button>
              With icon
              <Spacer size={4} />
              <RocketIcon />
            </Button>
            <Button variant="round">
              <CubeIcon />
            </Button>
            <LinkButton to="/kitchensink">As link</LinkButton>
            <Button size="large">Large</Button>
            <Button size="huge">Huge</Button>
            <Button variant="inverted">Inverted</Button>
            <Button variant="inverted" size="large">
              Inverted large
            </Button>
            <Button variant="inverted" size="huge">
              Inverted huge
            </Button>
          </Stack>
        </Component>
        <Component title="Stack">
          <Stack gap={36} axis="horizontal">
            <Stack gap={8}>
              <Box></Box>
              <Box></Box>
              <Box></Box>
            </Stack>
            <Stack gap={8} axis="horizontal">
              <Box></Box>
              <Box></Box>
              <Box></Box>
            </Stack>
          </Stack>
        </Component>
      </Stack>
    </div>
  )
}

const Component: FC<{ title: string }> = ({ title, children }) => {
  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  )
}

const Box = styled.div`
  width: 100px;
  height: 50px;
  background-color: ${({ theme }) => theme.colors.primary};
`

const SelectExample = () => {
  return (
    <Select defaultValue="banana">
      <Select.Group>
        <Select.Label>Fruits</Select.Label>
        <Select.Item value="apple">
          <Select.ItemText>Apple</Select.ItemText>
          <Select.ItemIndicator />
        </Select.Item>
        <Select.Item value="banana">
          <Select.ItemText>Banana</Select.ItemText>
          <Select.ItemIndicator />
        </Select.Item>
        <Select.Item value="blueberry">
          <Select.ItemText>Blueberry</Select.ItemText>
          <Select.ItemIndicator />
        </Select.Item>
        <Select.Item value="grapes">
          <Select.ItemText>Grapes</Select.ItemText>
          <Select.ItemIndicator />
        </Select.Item>
        <Select.Item value="pineapple">
          <Select.ItemText>Pineapple</Select.ItemText>
          <Select.ItemIndicator />
        </Select.Item>
      </Select.Group>

      <Select.Separator />

      <Select.Group>
        <Select.Label>Vegetables</Select.Label>
        <Select.Item value="aubergine">
          <Select.ItemText>Aubergine</Select.ItemText>
          <Select.ItemIndicator />
        </Select.Item>
        <Select.Item value="broccoli">
          <Select.ItemText>Broccoli</Select.ItemText>
          <Select.ItemIndicator />
        </Select.Item>
        <Select.Item value="carrot" disabled>
          <Select.ItemText>Carrot</Select.ItemText>
          <Select.ItemIndicator />
        </Select.Item>
        <Select.Item value="courgette">
          <Select.ItemText>Courgette</Select.ItemText>
          <Select.ItemIndicator />
        </Select.Item>
        <Select.Item value="leek">
          <Select.ItemText>leek</Select.ItemText>
          <Select.ItemIndicator />
        </Select.Item>
      </Select.Group>

      <Select.Separator />

      <Select.Group>
        <Select.Label>Meat</Select.Label>
        <Select.Item value="beef">
          <Select.ItemText>Beef</Select.ItemText>
          <Select.ItemIndicator />
          <Select.ItemText>Chicken</Select.ItemText>
          <Select.ItemIndicator />
          <Select.ItemText>Lamb</Select.ItemText>
          <Select.ItemIndicator />
          <Select.ItemText>Pork</Select.ItemText>
          <Select.ItemIndicator />
        </Select.Item>
      </Select.Group>
    </Select>
  )
}

const TableExample = () => {
  return (
    <Table>
      <Table.Head>
        <tr>
          <Table.Heading>Date</Table.Heading>
          <Table.Heading>Location</Table.Heading>
          <Table.Heading numeric>Rating</Table.Heading>
          <Table.Heading>Comment</Table.Heading>
        </tr>
      </Table.Head>
      <tbody>
        <Table.ClickableRow onClick={() => alert("click")}>
          <Table.Cell>Last Friday</Table.Cell>
          <Table.Cell>Franzén</Table.Cell>
          <Table.Cell numeric>3</Table.Cell>
          <Table.Cell>This row is clickable</Table.Cell>
        </Table.ClickableRow>
        <Table.LinkRow to="/">
          <Table.Cell>Last monday</Table.Cell>
          <Table.Cell>Franzén</Table.Cell>
          <Table.Cell numeric>3</Table.Cell>
          <Table.Cell>This row is a link</Table.Cell>
        </Table.LinkRow>
        <tr>
          <Table.Cell>2022-04-02</Table.Cell>
          <Table.Cell>
            <Link to="/kitchensink">WokHouse</Link>
          </Table.Cell>
          <Table.Cell numeric>3</Table.Cell>
          <Table.Cell>The best restaurant in town</Table.Cell>
        </tr>
        <tr>
          <Table.Cell>2021-06-23</Table.Cell>
          <Table.Cell>
            <Link to="/kitchensink">Franzén</Link>
          </Table.Cell>
          <Table.Cell numeric>3</Table.Cell>
          <Table.Cell>Meh :/</Table.Cell>
        </tr>
      </tbody>
    </Table>
  )
}

const people = [
  {
    id: 1,
    avatar:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    name: "Gilberto Miguel",
    username: "@gilberto_miguel",
  },
  {
    id: 2,
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    name: "Maia Pettegree",
    username: "@mpettegree",
  },
  {
    id: 3,
    avatar:
      "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    name: "Wade Redington",
    username: "@redington",
  },
  {
    id: 4,
    avatar:
      "https://images.unsplash.com/photo-1528763380143-65b3ac89a3ff?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    name: "Kurtis Gurrado",
    username: "@kurtis",
  },
  {
    id: 5,
    avatar:
      "https://images.unsplash.com/photo-1569913486515-b74bf7751574?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    name: "Sonja Balmann",
    username: "@sbalmann",
  },
  {
    id: 6,
    avatar:
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    name: "Brent Mickelwright",
    username: "@brent_m",
  },
]

const ComboBoxExample = () => {
  return (
    <ComboBox label="Assignee" defaultItems={people}>
      {(item) => (
        <Item textValue={item.name}>
          <div>
            <Label>{item.name}</Label>
            <Description>{item.username}</Description>
          </div>
        </Item>
      )}
    </ComboBox>
  )
}

const locationsMock = [
  {
    id: 1,
    lat: "59.331582",
    lon: "18.0664337",
    name: "WokHouse",
    address: "Fake address 1",
    averageScore: 4.2,
    highestScore: 8,
    lowestScore: 2,
    lunchCount: 4,
  },
  {
    id: 2,
    lat: "59.3339128",
    lon: "18.0564237",
    name: "Franzén",
    address: "Fake address 1",
    averageScore: 7.9,
    highestScore: 8,
    lowestScore: 2,
    lunchCount: 4,
  },
  {
    id: 3,
    lat: "59.3414987",
    lon: "18.0371404",
    name: "Zocalo",
    address: "Fake address 1",
    averageScore: 9,
    highestScore: 8,
    lowestScore: 2,
    lunchCount: 4,
  },
]
