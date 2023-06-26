import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import type { Group, GroupMember } from "~/models/group.server"
import { getGroupPermissions } from "~/models/group.server"
import type { User } from "~/models/user.server"
import { json, redirect } from "@remix-run/node"
import { Form, Link, useActionData, useFetcher, useLoaderData } from "@remix-run/react"
import styled from "styled-components"
import invariant from "tiny-invariant"
import { Button, TextButton } from "~/components/Button"
import { Dialog } from "~/components/Dialog"
import { Input } from "~/components/Input"
import { Spacer } from "~/components/Spacer"
import { Stack } from "~/components/Stack"
import { deleteGroup, getGroup, updateGroup } from "~/models/group.server"
import z from "zod"
import { requireUserId } from "~/session.server"
import { useEffect, useRef, useState } from "react"
import { Table } from "~/components/Table"
import { optionalNumeric, type RecursivelyConvertDatesToStrings } from "~/utils"
import { Checkbox } from "~/components/Checkbox"
import { Help } from "~/components/Help"
import { parse } from "@conform-to/zod"
import { useForm, conform } from "@conform-to/react"

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireUserId(request)
  invariant(params.groupId, "groupId is required")
  const group = await getGroup({
    id: params.groupId,
  })

  if (!group) throw new Response("Not found", { status: 404 })

  const permissions = await getGroupPermissions({
    currentUserId: userId,
    group,
  })

  if (!permissions.settings) throw new Response("Permission denied", { status: 401 })

  return json({
    group,
    userId,
  })
}

const updateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  lat: optionalNumeric(),
  lon: optionalNumeric(),
  public: z.preprocess((x) => x === "on", z.boolean()),
  action: z.literal("update", {
    required_error: "Action is required",
  }),
})

const deleteSchema = z.object({
  action: z.literal("delete", {
    required_error: "Action is required",
  }),
})

const schema = z.discriminatedUnion("action", [updateSchema, deleteSchema])

export const action = async ({ request, params }: ActionArgs) => {
  const userId = await requireUserId(request)
  invariant(params.groupId, "groupId not found")

  const formData = await request.formData()
  const submission = parse(formData, { schema })
  if (!submission.value || submission.intent !== "submit") {
    return json(submission, { status: 400 })
  }

  switch (submission.value.action) {
    case "delete":
      return deleteGroupAction(userId, params.groupId)
    default:
      return updateGroupAction(formData, params.groupId)
  }
}

const updateGroupAction = async (formData: FormData, groupId: Group["id"]) => {
  const submission = parse(formData, { schema })
  if (!submission.value || submission.intent !== "submit" || submission.value.action === "delete") {
    return json(submission, { status: 400 })
  }

  const { name, lat, lon, public: isGroupPublic } = submission.value

  const group = await updateGroup({
    id: groupId,
    name,
    lat,
    lon,
    public: isGroupPublic,
  })

  return redirect(`/groups/${group.id}`)
}

const deleteGroupAction = async (userId: User["id"], groupId: Group["id"]) => {
  await deleteGroup({
    id: groupId,
    requestedByUserId: userId,
  })

  return redirect("/groups")
}

export default function GroupSettingsPage() {
  const { group, userId } = useLoaderData<typeof loader>()
  const latRef = useRef<HTMLInputElement>(null)
  const lonRef = useRef<HTMLInputElement>(null)

  const lastSubmission = useActionData<typeof action>()
  const [form, { name, lat, lon, public: publicSetting }] = useForm({
    id: "group-settings-form",
    lastSubmission,
    onValidate: ({ formData }) => parse(formData, { schema }),
    defaultValue: {
      name: group.name,
      lat: group.lat,
      lon: group.lon,
    },
  })

  const handleCoordinatePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const value = e.clipboardData.getData("Text")

    if (!value || value.indexOf(",") === -1) return

    const [lat, lon] = value.split(",")

    requestAnimationFrame(() => {
      latRef.current!.value = lat
      lonRef.current!.value = lon
    })
  }

  return (
    <div>
      <Form method="post" {...form.props}>
        <Subtitle>Details</Subtitle>
        <div>
          <label htmlFor={name.id}>Name</label>
          <div>
            <Input {...conform.input(name, { ariaAttributes: true })} autoComplete="name" />
            {name.error && <div id={`${name.id}-error`}>{name.error}</div>}
          </div>
        </div>
        <Spacer size={16} />
        <Subtitle>Club location</Subtitle>
        <FieldDescription>Your clubs home base. Affects maps and recommendations.</FieldDescription>
        <Stack axis="horizontal" gap={16}>
          <div style={{ width: "100%" }}>
            <label>
              <span>Latitude</span>
              <Input {...conform.input(lat)} ref={latRef} onPaste={handleCoordinatePaste} />
            </label>
            {lat.error && <div id={`${lat.id}-error`}>{lat.error}</div>}
          </div>

          <div style={{ width: "100%" }}>
            <label>
              <span>Longitude</span>
              <Input {...conform.input(lon)} ref={lonRef} onPaste={handleCoordinatePaste} />
            </label>
            {lon.error && <div id={`${lon.id}-error`}>{lon.error}</div>}
          </div>
        </Stack>
        <Spacer size={16} />
        <Subtitle>Settings</Subtitle>
        <div>
          <Stack axis="horizontal" gap={8} align="center">
            <Checkbox
              name={publicSetting.name}
              id={publicSetting.id}
              defaultChecked={group.public}
              required={publicSetting.required}
            />
            <label htmlFor={publicSetting.id}>Public</label>
            <Help>
              Public groups are accessible by anyone, even if they're not a user of Fredagslunchen or a member
              of your group.
            </Help>
          </Stack>
          {publicSetting.error && <div id="public-error">{publicSetting.error}</div>}
        </div>
        <Spacer size={16} />
        <input type="hidden" name="action" value="update" />
        <Button style={{ marginLeft: "auto" }}>Save changes</Button>
      </Form>
      <Subtitle>Members</Subtitle>
      <Table>
        <Table.Head>
          <tr>
            <Table.Heading wide>Name</Table.Heading>
            <Table.Heading>
              <Stack axis="horizontal" gap={4}>
                Inactive
                <Help>Inactive members are hidden from the group.</Help>
              </Stack>
            </Table.Heading>
            <Table.Heading>Role</Table.Heading>
            <Table.Heading></Table.Heading>
          </tr>
        </Table.Head>
        <tbody>
          {group.members.map((member) => (
            <tr key={member.userId}>
              <Table.Cell wide>
                <Link to={`/users/${member.userId}`}>{member.user.name}</Link>
              </Table.Cell>
              <Table.Cell>
                <InactiveMemberAction member={member} />
              </Table.Cell>
              <Table.Cell>
                {member.userId !== userId ? <ChangeMemberRoleAction member={member} /> : "You"}
              </Table.Cell>
              <Table.Cell>{member.userId !== userId && <RemoveMemberAction member={member} />}</Table.Cell>
            </tr>
          ))}
        </tbody>
      </Table>
      <Spacer size={24} />
      <Subtitle>Destructive actions</Subtitle>
      <DeleteGroupAction groupName={group.name} />
    </div>
  )
}

const FieldDescription = styled.p`
  margin: 0;
`

const Subtitle = styled.h3`
  font-size: 18px;
  margin: 16px 0;

  + ${FieldDescription} {
    margin-top: -16px;
    margin-bottom: 16px;
  }
`

const DeleteGroupAction = ({ groupName }: { groupName: Group["name"] }) => {
  const [confirmNameValue, setConfirmNameValue] = useState("")

  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button>Delete club</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Close />
        <Dialog.Title>Are you sure you want to delete the club {groupName}?</Dialog.Title>
        <DialogDescription>
          This will delete this club including all locations, lunches and scores. This action{" "}
          <strong>cannot be undone.</strong>
        </DialogDescription>
        <label htmlFor="name">
          Please type <strong>{groupName}</strong> to confirm.
        </label>
        <Input id="name" required name="name" onChange={(e) => setConfirmNameValue(e.target.value)} />
        <Spacer size={16} />
        <Form method="post">
          <input type="hidden" name="action" value="delete" />
          <Button size="large" style={{ marginLeft: "auto" }} disabled={confirmNameValue !== groupName}>
            I am sure
          </Button>
        </Form>
      </Dialog.Content>
    </Dialog>
  )
}

const DialogDescription = styled(Dialog.Description)`
  > p {
    margin: 0;
    margin-bottom: 16px;
  }
`

type RemoveMemberActionProps = {
  member: RecursivelyConvertDatesToStrings<GroupMember & { user: User }>
}
const RemoveMemberAction = ({ member }: RemoveMemberActionProps) => {
  const fetcher = useFetcher()

  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <TextButton>Remove</TextButton>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Close />
        <Dialog.Title>Are you sure you want to remove {member.user.name} from the club?</Dialog.Title>
        <DialogDescription>
          This will delete all their scores and comments. This action <strong>cannot be undone</strong>!
        </DialogDescription>
        <Spacer size={16} />
        <fetcher.Form action="/api/groups/member" method="post">
          <input name="userId" value={member.userId} type="hidden" />
          <input name="groupId" value={member.groupId} type="hidden" />
          <input name="action" value={"delete"} type="hidden" />
          <Button size="large" style={{ marginLeft: "auto" }}>
            I am sure
          </Button>
        </fetcher.Form>
      </Dialog.Content>
    </Dialog>
  )
}

type ChangeMemberRoleActionProps = {
  member: RecursivelyConvertDatesToStrings<GroupMember & { user: User }>
}
const ChangeMemberRoleAction = ({ member }: ChangeMemberRoleActionProps) => {
  const [open, setOpen] = useState(false)
  const fetcher = useFetcher()

  useEffect(() => {
    if (fetcher.data?.ok) setOpen(false)
  }, [fetcher.data])

  if (member.user.role === "ANONYMOUS") return <span>Anonymous</span>

  // TODO rewrite the inline logic here
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <TextButton style={{ paddingLeft: 0 }}>
          {member.role === "ADMIN" ? "Make user" : "Make admin"}
        </TextButton>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Close />
        <Dialog.Title>
          Are you sure you want to make {member.user.name} {member.role === "ADMIN" ? "a user" : "an admin"}?
        </Dialog.Title>
        <DialogDescription>
          {member.role === "ADMIN" ? (
            <>
              This will <strong>remove</strong> their access to club settings.
            </>
          ) : (
            <>
              This will <strong>give them access</strong> to club settings.
            </>
          )}
        </DialogDescription>
        <Spacer size={8} />
        <fetcher.Form action="/api/groups/member" method="post">
          <input name="userId" value={member.userId} type="hidden" />
          <input name="groupId" value={member.groupId} type="hidden" />
          <input name="action" value={"update"} type="hidden" />
          <input name="role" value={member.role === "ADMIN" ? "MEMBER" : "ADMIN"} type="hidden" />
          <Button size="large" style={{ marginLeft: "auto" }}>
            I am sure
          </Button>
        </fetcher.Form>
      </Dialog.Content>
    </Dialog>
  )
}

type InactiveMemberActionProps = {
  member: RecursivelyConvertDatesToStrings<GroupMember & { user: User }>
}
const InactiveMemberAction = ({ member }: InactiveMemberActionProps) => {
  const fetcher = useFetcher()

  const handleChange = (value: boolean) => {
    fetcher.submit(
      {
        userId: member.userId,
        groupId: member.groupId,
        action: "update",
        inactive: value.toString(),
      },
      {
        method: "post",
        action: "/api/groups/member",
      }
    )
  }

  return (
    <fetcher.Form action="/api/groups/member" method="post">
      <input name="userId" value={member.userId} type="hidden" />
      <input name="groupId" value={member.groupId} type="hidden" />
      <input name="action" value={"update"} type="hidden" />
      <input name="role" value={member.role} type="hidden" />
      <Checkbox name="inactive" checked={member.inactive} onCheckedChange={handleChange} />
    </fetcher.Form>
  )
}
