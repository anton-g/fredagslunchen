import type { ActionFunction } from "@remix-run/server-runtime"
import { redirect } from "@remix-run/server-runtime"
import { json } from "@remix-run/server-runtime"
import {
  createScore,
  createScoreWithNewAnonymousUser,
} from "~/models/score.server"
import { requireUserId } from "~/session.server"
import { safeRedirect } from "~/utils"

type ActionData = {
  errors?: {
    score?: string
    user?: string
    lunchId?: string
    groupId?: string
  }
}

export const action: ActionFunction = async ({ request, params }) => {
  await requireUserId(request)

  const formData = await request.formData()
  const scoreString = formData.get("score")
  const score = scoreString ? parseFloat(scoreString.toString()) : null
  const comment = formData.get("comment")
  const user = formData.get("user")
  const userId = formData.get("user-key")
  const lunchId = formData.get("lunchId")

  if (typeof user !== "string" || user.length === 0) {
    return json<ActionData>(
      { errors: { user: "User is required" } },
      { status: 400 }
    )
  }

  if (score === null || score === undefined || isNaN(score)) {
    return json<ActionData>(
      { errors: { score: "Score is required" } },
      { status: 400 }
    )
  }

  if (score < 0 || score > 10) {
    return json<ActionData>(
      { errors: { score: "Score must be between 0 and 10" } },
      { status: 400 }
    )
  }

  if (typeof lunchId !== "string" || lunchId.length === 0) {
    return json<ActionData>(
      { errors: { lunchId: "Lunch is required" } },
      { status: 400 }
    )
  }

  // Score for existing user
  if (typeof userId === "string" && userId.length > 0) {
    await createScore({
      userId,
      score,
      comment: comment ? comment.toString() : null,
      lunchId: parseInt(lunchId),
    })

    const redirectToValue = formData.get("redirectTo")
    if (redirectToValue) {
      const redirectTo = safeRedirect(redirectToValue)

      return redirect(redirectTo)
    }

    return json({ ok: true })
  }

  // Score for new anonymous user
  const groupId = formData.get("groupId")

  if (typeof groupId !== "string" || groupId.length === 0) {
    return json<ActionData>(
      { errors: { groupId: "Group is required" } },
      { status: 400 }
    )
  }

  await createScoreWithNewAnonymousUser({
    comment: comment ? comment.toString() : null,
    lunchId: parseInt(lunchId),
    groupId: groupId,
    score,
    newUserName: user,
  })

  return json({ ok: true })
}
