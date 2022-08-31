import type { ActionFunction } from "@remix-run/server-runtime"
import { json } from "@remix-run/server-runtime"
import { deleteGroupMember } from "~/models/group.server"
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

  if (typeof userId !== "string" || userId.length === 0) {
    return json<ActionData>(
      { errors: { error: "Something went wrong 3" } },
      { status: 400 }
    )
  }

  if (typeof groupId !== "string" || groupId.length === 0) {
    return json<ActionData>(
      { errors: { error: "Something went wrong 4" } },
      { status: 400 }
    )
  }

  if (request.method === "DELETE") {
    const result = await deleteGroupMember({
      groupId,
      userId,
      requestedByUserId: currentUserId,
    })
    console.log(result)
  }
  // else {
  //   await createGroupInviteToken({
  //     userId,
  //     groupId,
  //   })
  // }

  return json({ ok: true })
}
