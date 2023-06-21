import type { ActionFunction } from "@remix-run/server-runtime"
import { json } from "@remix-run/server-runtime"
import { deleteScoreRequest } from "~/models/score.server"
import { requireUserId } from "~/session.server"

type ActionData = {
  ok: boolean
}

export const action: ActionFunction = async ({ request, params }) => {
  await requireUserId(request)

  const formData = await request.formData()
  const requestId = formData.get("requestId")

  if (typeof requestId !== "string" || requestId.length === 0) {
    return json<ActionData>({ ok: false }, { status: 400 })
  }

  console.log(requestId)

  deleteScoreRequest({
    id: parseInt(requestId),
  })

  return json({ ok: true })
}
