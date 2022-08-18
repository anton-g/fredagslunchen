import type { ActionFunction } from "@remix-run/server-runtime"
import { json } from "@remix-run/server-runtime"
import { deleteScore } from "~/models/score.server"
import { requireUserId } from "~/session.server"

type ActionData = {
  ok: boolean
}

export const action: ActionFunction = async ({ request, params }) => {
  const currentUserId = await requireUserId(request)

  const formData = await request.formData()
  const scoreId = formData.get("scoreId")

  if (typeof scoreId !== "string" || scoreId.length === 0) {
    return json<ActionData>({ ok: false }, { status: 400 })
  }

  deleteScore({
    id: parseInt(scoreId),
    requestedByUserId: currentUserId,
  })

  return json({ ok: true })
}
