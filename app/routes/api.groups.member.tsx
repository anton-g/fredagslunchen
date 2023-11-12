import type { ActionFunctionArgs } from "@remix-run/server-runtime"
import { json } from "@remix-run/server-runtime"
import { deleteGroupMember, updateGroupMembership as updateGroupMember } from "~/models/group.server"
import { requireUserId } from "~/auth.server"

type ActionData =
  | {
      ok: false
      errors?: {
        error?: string
      }
    }
  | {
      ok: true
    }

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const currentUserId = await requireUserId(request)

  const formData = await request.formData()
  const userId = formData.get("userId")
  const groupId = formData.get("groupId")
  const action = formData.get("action")

  if (typeof action !== "string" || action.length === 0) {
    return json<ActionData>({ ok: false, errors: { error: "Something went wrong" } }, { status: 400 })
  }

  if (typeof userId !== "string" || userId.length === 0) {
    return json<ActionData>({ ok: false, errors: { error: "Something went wrong" } }, { status: 400 })
  }

  if (typeof groupId !== "string" || groupId.length === 0) {
    return json<ActionData>({ ok: false, errors: { error: "Something went wrong" } }, { status: 400 })
  }

  if (action === "delete") {
    const deleteScores = formData.get("deleteScores")
    if (deleteScores && typeof deleteScores !== "string") {
      return json<ActionData>({ ok: false, errors: { error: "Something went wrong" } }, { status: 400 })
    }

    await deleteGroupMember({
      groupId,
      userId,
      requestedByUserId: currentUserId,
      deleteScores: deleteScores === "on",
    })
    return json<ActionData>({ ok: true })
  }

  const role = formData.get("role")
  if (role && (typeof role !== "string" || !["ADMIN", "MEMBER"].includes(role))) {
    return json<ActionData>({ ok: false, errors: { error: "Something went wrong" } }, { status: 400 })
  }

  const inactive = formData.get("inactive")
  if (inactive && (typeof inactive !== "string" || !["true", "false"].includes(inactive))) {
    return json<ActionData>({ ok: false, errors: { error: "Something went wrong" } }, { status: 400 })
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

  return json<ActionData>({ ok: true })
}
