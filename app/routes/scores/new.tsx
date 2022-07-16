import type { ActionFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { createScore } from "~/models/score.server";
import { requireUserId } from "~/session.server";

type ActionData = {
  errors?: {
    score?: string;
    user?: string;
    lunchId?: string;
  };
};

export const action: ActionFunction = async ({ request, params }) => {
  await requireUserId(request);

  const formData = await request.formData();
  const scoreString = formData.get("score");
  const score = scoreString ? parseFloat(scoreString.toString()) : null;
  const comment = formData.get("comment");
  const userId = formData.get("user-key");
  const lunchId = formData.get("lunchId");

  if (typeof userId !== "string" || userId.length === 0) {
    return json<ActionData>(
      { errors: { user: "User is required" } },
      { status: 400 }
    );
  }

  if (!score || isNaN(score) || score < 0 || score > 10) {
    return json<ActionData>(
      { errors: { score: "Score is required" } },
      { status: 400 }
    );
  }

  if (typeof lunchId !== "string" || lunchId.length === 0) {
    return json<ActionData>(
      { errors: { lunchId: "Lunch is required" } },
      { status: 400 }
    );
  }

  await createScore({
    userId,
    score,
    comment: comment ? comment.toString() : null,
    lunchId: parseInt(lunchId),
  });

  return json({ ok: true });
};
