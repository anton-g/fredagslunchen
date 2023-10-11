import type { ActionFunctionArgs } from "@remix-run/server-runtime"
import { json } from "@remix-run/server-runtime"
import { deleteScore } from "~/models/score.server"
import { requireUserId } from "~/auth.server"

type ActionData = {
  ok: boolean
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const currentUserId = await requireUserId(request)

  const formData = await request.formData()
  const scoreId = formData.get("scoreId")

  if (typeof scoreId !== "string" || scoreId.length === 0) {
    return json<ActionData>({ ok: false }, { status: 400 })
  }

  await deleteScore({
    id: parseInt(scoreId),
    requestedByUserId: currentUserId,
  })

  return json({ ok: true })
}
