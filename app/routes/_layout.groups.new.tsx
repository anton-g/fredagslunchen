import type { ActionFunctionArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Form, useActionData } from "@remix-run/react"
import z from "zod"
import { Button } from "~/components/Button"
import { Input } from "~/components/Input"
import { Stack } from "~/components/Stack"
import { parse } from "@conform-to/zod"
import { useForm, conform } from "@conform-to/react"
import { createGroup } from "~/models/group.server"
import { requireUserId } from "~/auth.server"

const schema = z.object({
  name: z.string().min(1, "Name is required"),
})

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request)

  const formData = await request.formData()
  const submission = parse(formData, { schema })
  if (!submission.value || submission.intent !== "submit") {
    return json(submission, { status: 400 })
  }

  const name = submission.value.name

  const group = await createGroup({ name, userId })

  return redirect(`/groups/${group.id}`)
}

export default function NewGroupPage() {
  const lastSubmission = useActionData<typeof action>()
  const [form, { name }] = useForm({
    id: "new-group-form",
    lastSubmission,
    onValidate: ({ formData }) => parse(formData, { schema }),
  })

  return (
    <>
      <h2>Create a new club</h2>
      <p>
        Create a new club to get started. When the club is created you can invite other users to join you on
        your lunch adventures!
      </p>
      <p>If you're looking to join a club, tell them to invite you instead!</p>
      <Form
        method="post"
        {...form.props}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          width: "100%",
        }}
      >
        <Stack gap={16}>
          <div>
            <label>
              <span>Name</span>
              <Input {...conform.input(name, { ariaAttributes: true })} />
            </label>
            {name.error && <div id="name-error">{name.error}</div>}
          </div>

          <div>
            <Button style={{ marginLeft: "auto" }} type="submit">
              Create club
            </Button>
          </div>
        </Stack>
      </Form>
    </>
  )
}
