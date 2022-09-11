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
  }
}

export const action: ActionFunction = async ({ request, params }) => {
  await requireUserId(request)

  const formData = await request.formData()
  const userId = formData.get("userId")
  const groupId = formData.get("groupId")

  if (typeof userId !== "string" || userId.length === 0) {
    return json<ActionData>(
      { errors: { user: "User is required" } },
      { status: 400 }
    )
  }

  if (typeof groupId !== "string" || groupId.length === 0) {
    return json<ActionData>(
      { errors: { user: "Club is required" } },
      { status: 400 }
    )
  }

  if (request.method === "DELETE") {
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
