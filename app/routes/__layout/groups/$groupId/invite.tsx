import type { ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import * as React from "react";
import invariant from "tiny-invariant";
import { Button } from "~/components/Button";
import { Input } from "~/components/Input";
import { Stack } from "~/components/Stack";
import { addUserToGroup } from "~/models/group.server";

import { requireUserId } from "~/session.server";

type ActionData = {
  errors?: {
    email?: string;
  };
};

export const action: ActionFunction = async ({ request, params }) => {
  await requireUserId(request);
  const groupId = params.groupId;
  invariant(groupId, "groupId not found");

  const formData = await request.formData();
  const email = formData.get("email");

  if (typeof email !== "string" || email.length === 0) {
    return json<ActionData>(
      { errors: { email: "Email is required" } },
      { status: 400 }
    );
  }

  const group = await addUserToGroup({ groupId, email });

  if ("error" in group) {
    return json<ActionData>(
      { errors: { email: group.error } },
      { status: 400 }
    );
  }

  return redirect(`/groups/${group.id}`);
};

export default function NewGroupPage() {
  const actionData = useActionData() as ActionData;
  const emailRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    }
  }, [actionData]);

  return (
    <>
      <h3>Invite user to group</h3>
      <Form
        method="post"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          width: "100%",
        }}
      >
        <Stack gap={16}>
          <div>
            <label>
              <span>Email</span>
              <Input
                ref={emailRef}
                name="email"
                type="email"
                aria-invalid={actionData?.errors?.email ? true : undefined}
                aria-errormessage={
                  actionData?.errors?.email ? "email-error" : undefined
                }
              />
            </label>
            {actionData?.errors?.email && (
              <div id="email-error">{actionData.errors.email}</div>
            )}
          </div>

          <div>
            <Button style={{ marginLeft: "auto" }} type="submit">
              Save
            </Button>
          </div>
        </Stack>
      </Form>
    </>
  );
}
