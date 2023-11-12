import type { ActionFunctionArgs } from "@remix-run/server-runtime"
import { json } from "@remix-run/server-runtime"
import { createScoreRequest } from "~/models/score.server"
import { requireUserId } from "~/auth.server"

type ActionData = {
  ok: boolean
  errors?: {
    userId?: string
    lunchId?: string
    score?: string
  }
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const currentUserId = await requireUserId(request, "/")

  const formData = await request.formData()
  const userId = formData.get("userId")
  const lunchId = formData.get("lunchId")

  if (typeof userId !== "string" || userId.length === 0) {
    return json<ActionData>({ ok: false, errors: { userId: "User is required" } }, { status: 400 })
  }

  if (currentUserId === userId) {
    return json<ActionData>(
      {
        ok: false,
        errors: { userId: "Can't request rating from yourself" },
      },
      { status: 400 },
    )
  }

  if (typeof lunchId !== "string" || lunchId.length === 0) {
    return json<ActionData>({ ok: false, errors: { lunchId: "Lunch is required" } }, { status: 400 })
  }

  const result = await createScoreRequest({
    id: userId,
    lunchId: parseInt(lunchId),
    requestedById: currentUserId,
  })

  if ("error" in result) {
    return json<ActionData>(
      {
        ok: false,
        errors: {
          userId: result.error,
        },
      },
      { status: 400 },
    )
  }

  return json<ActionData>({ ok: true })
}
