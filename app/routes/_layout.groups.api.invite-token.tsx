import type { ActionFunction } from "@remix-run/server-runtime"
import { json } from "@remix-run/server-runtime"
import {
  createGroupInviteToken,
  deleteGroupInviteToken,
} from "~/models/group.server"
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

export const action: ActionFunction = async ({ request, params }) => {
  await requireUserId(request)

  const formData = await request.formData()
  const userId = formData.get("userId")
  const groupId = formData.get("groupId")
  const action = formData.get("action")

  if (typeof userId !== "string" || userId.length === 0) {
    return json<ActionData>(
      { errors: { user: "User is required" } },
      { status: 400 }
    )
  }

  if (typeof groupId !== "string" || groupId.length === 0) {
    return json<ActionData>(
      { errors: { groupId: "Club is required" } },
      { status: 400 }
    )
  }

  if (typeof action !== "string" || action.length === 0) {
    return json<ActionData>(
      { errors: { action: "Action is required" } },
      { status: 400 }
    )
  }

  if (action === "delete") {
    await deleteGroupInviteToken({
      userId,
      groupId,
    })
  } else {
    await createGroupInviteToken({
      userId,
      groupId,
    })
  }

  return json({ ok: true })
}
