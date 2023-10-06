import type { ActionFunctionArgs } from "@remix-run/server-runtime"
import { json } from "@remix-run/server-runtime"
import { createGroupInviteToken, deleteGroupInviteToken } from "~/models/group.server"
import { requireUserId } from "~/session.server"

type ActionData = {
  errors?: {
    score?: string
    user?: string
    lunchId?: string
    groupId?: string
    action?: string
  }
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const currentUserId = await requireUserId(request)

  const formData = await request.formData()
  const groupId = formData.get("groupId")
  const action = formData.get("action")

  if (typeof groupId !== "string" || groupId.length === 0) {
    return json<ActionData>({ errors: { groupId: "Club is required" } }, { status: 400 })
  }

  if (typeof action !== "string" || action.length === 0) {
    return json<ActionData>({ errors: { action: "Action is required" } }, { status: 400 })
  }

  if (action === "delete") {
    await deleteGroupInviteToken({
      requestedByUserId: currentUserId,
      groupId,
    })
  } else {
    await createGroupInviteToken({
      requestedByUserId: currentUserId,
      groupId,
    })
  }

  return json({ ok: true })
}
