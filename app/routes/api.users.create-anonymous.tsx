import type { ActionFunctionArgs } from "@remix-run/server-runtime"
import { json } from "@remix-run/server-runtime"
import { createAnonymousUser } from "~/models/user.server"
import { requireUserId } from "~/auth.server"

export type CreateAnonymousUserActionData = {
  ok: boolean
  errors?: {
    name?: string
    groupId?: string
  }
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const currentUserId = await requireUserId(request, "/")

  const formData = await request.formData()
  const name = formData.get("name")
  const groupId = formData.get("groupId")

  if (typeof name !== "string" || name.length === 0) {
    return json<CreateAnonymousUserActionData>(
      { ok: false, errors: { name: "Name is required" } },
      { status: 400 },
    )
  }

  if (typeof groupId !== "string" || groupId.length === 0) {
    return json<CreateAnonymousUserActionData>(
      { ok: false, errors: { groupId: "GroupId is required" } },
      { status: 400 },
    )
  }

  const createdUser = await createAnonymousUser(name, groupId, currentUserId)

  if (!createdUser) {
    return json<CreateAnonymousUserActionData>({ ok: false })
  }

  return json<CreateAnonymousUserActionData>({ ok: true })
}
