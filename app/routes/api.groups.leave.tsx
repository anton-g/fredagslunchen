import { redirect, type ActionFunctionArgs } from "@remix-run/server-runtime"
import { json } from "@remix-run/server-runtime"
import { deleteGroupMember } from "~/models/group.server"
import { requireUserId } from "~/auth.server"

type ActionData = {
  errors?: {
    group?: string
  }
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireUserId(request)

  const formData = await request.formData()
  const groupId = formData.get("groupId")
  const deleteScores = formData.get("deleteScores")

  if (typeof groupId !== "string" || groupId.length === 0) {
    return json<ActionData>({ errors: { group: "Club is required" } }, { status: 400 })
  }

  if (deleteScores && typeof deleteScores !== "string") {
    return json<ActionData>({ errors: { group: "Something went wrong" } }, { status: 400 })
  }

  await deleteGroupMember({
    groupId,
    userId,
    deleteScores: deleteScores === "on",
    requestedByUserId: userId,
  })
  return redirect("/groups")
}
