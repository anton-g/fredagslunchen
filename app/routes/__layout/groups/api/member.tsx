import type { ActionFunction } from "@remix-run/server-runtime"
import { json } from "@remix-run/server-runtime"
import {
  deleteGroupMember,
  updateGroupMembership as updateGroupMember,
} from "~/models/group.server"
import { requireUserId } from "~/session.server"

type ActionData = {
  errors?: {
    error?: string
  }
}

export const action: ActionFunction = async ({ request, params }) => {
  const currentUserId = await requireUserId(request)

  const formData = await request.formData()
  const userId = formData.get("userId")
  const groupId = formData.get("groupId")
  const action = formData.get("action")

  if (typeof action !== "string" || action.length === 0) {
    return json<ActionData>(
      { errors: { error: "Something went wrong" } },
      { status: 400 }
    )
  }

  if (typeof userId !== "string" || userId.length === 0) {
    return json<ActionData>(
      { errors: { error: "Something went wrong" } },
      { status: 400 }
    )
  }

  if (typeof groupId !== "string" || groupId.length === 0) {
    return json<ActionData>(
      { errors: { error: "Something went wrong" } },
      { status: 400 }
    )
  }

  if (action === "delete") {
    await deleteGroupMember({
      groupId,
      userId,
      requestedByUserId: currentUserId,
    })
    return json({ ok: true })
  }

  const role = formData.get("role")
  if (
    role &&
    (typeof role !== "string" || !["ADMIN", "MEMBER"].includes(role))
  ) {
    return json<ActionData>(
      { errors: { error: "Something went wrong" } },
      { status: 400 }
    )
  }

  const inactive = formData.get("inactive")
  if (
    inactive &&
    (typeof inactive !== "string" || !["true", "false"].includes(inactive))
  ) {
    return json<ActionData>(
      { errors: { error: "Something went wrong" } },
      { status: 400 }
    )
  }

  await updateGroupMember({
    userId,
    groupId,
    requestedByUserId: currentUserId,
    update: {
      role: role ?? undefined,
      inactive: inactive ? inactive === "true" : undefined,
    },
  })

  return json({ ok: true })
}
