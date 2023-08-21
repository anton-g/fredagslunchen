import type { ActionFunction } from "@remix-run/server-runtime"
import { json } from "@remix-run/server-runtime"
import { createAnonymousUser } from "~/models/user.server"
import { requireUserId } from "~/session.server"

type ActionData = {
  errors?: {
    name?: string
    groupId?: string
  }
}

export const action: ActionFunction = async ({ request, params }) => {
  const currentUserId = await requireUserId(request, "/")

  const formData = await request.formData()
  const name = formData.get("name")
  const groupId = formData.get("groupId")

  if (typeof name !== "string" || name.length === 0) {
    return json<ActionData>({ errors: { name: "Name is required" } }, { status: 400 })
  }

  if (typeof groupId !== "string" || groupId.length === 0) {
    return json<ActionData>({ errors: { groupId: "GroupId is required" } }, { status: 400 })
  }

  const createdUser = await createAnonymousUser(name, groupId, currentUserId)

  if (!createdUser) {
    return json({ ok: false })
  }

  return json({ ok: true })
}
