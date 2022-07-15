import type { ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import * as React from "react";
import invariant from "tiny-invariant";
import { Button } from "~/components/Button";
import { Input } from "~/components/Input";
import { Stack } from "~/components/Stack";

import { createLunch } from "~/models/lunch.server";
import { requireUserId } from "~/session.server";

type ActionData = {
  errors?: {
    date?: string;
    choosenBy?: string;
    location?: string;
  };
};

export const action: ActionFunction = async ({ request, params }) => {
  await requireUserId(request);

  const formData = await request.formData();
  const date = formData.get("date");
  const location = formData.get("location");
  const choosenBy = formData.get("choosenBy");
  const groupId = params.groupId;
  invariant(groupId, "groupId not found");

  // TODO handle all errors
  if (typeof date !== "string" || date.length === 0) {
    return json<ActionData>(
      { errors: { date: "Date is required" } },
      { status: 400 }
    );
  }

  if (typeof location !== "string" || location.length === 0) {
    return json<ActionData>(
      { errors: { location: "Location is required" } },
      { status: 400 }
    );
  }

  if (typeof choosenBy !== "string" || choosenBy.length === 0) {
    return json<ActionData>(
      { errors: { choosenBy: "Choosen by is required" } },
      { status: 400 }
    );
  }

  const lunch = await createLunch({
    choosenByUserId: choosenBy,
    date: date,
    locationId: parseInt(location),
    groupId,
  });

  return redirect(`/groups/${groupId}/lunches/${lunch.id}`);
};

export default function NewLunchPage() {
  const actionData = useActionData() as ActionData;
  const choosenByRef = React.useRef<HTMLInputElement>(null);
  const locationRef = React.useRef<HTMLInputElement>(null);
  const dateRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.date) {
      dateRef.current?.focus();
    } else if (actionData?.errors?.location) {
      locationRef.current?.focus();
    } else if (actionData?.errors?.choosenBy) {
      choosenByRef.current?.focus();
    }
  }, [actionData]);

  return (
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
            <span>Date</span>
            <Input
              ref={dateRef}
              name="date"
              type="date"
              aria-invalid={actionData?.errors?.date ? true : undefined}
              aria-errormessage={
                actionData?.errors?.date ? "date-error" : undefined
              }
            />
          </label>
          {actionData?.errors?.date && (
            <div id="date-error">{actionData.errors.date}</div>
          )}
        </div>

        <div>
          <label>
            <span>Location</span>
            <Input
              ref={locationRef}
              name="location"
              aria-invalid={actionData?.errors?.location ? true : undefined}
              aria-errormessage={
                actionData?.errors?.location ? "location-error" : undefined
              }
            />
          </label>
          {actionData?.errors?.location && (
            <div id="location-error">{actionData.errors.location}</div>
          )}
        </div>

        <div>
          <label>
            <span>Choosen by</span>
            <Input
              ref={choosenByRef}
              name="choosenBy"
              aria-invalid={actionData?.errors?.choosenBy ? true : undefined}
              aria-errormessage={
                actionData?.errors?.choosenBy ? "choosenBy-error" : undefined
              }
            />
          </label>
          {actionData?.errors?.choosenBy && (
            <div id="choosenBy-error">{actionData.errors.choosenBy}</div>
          )}
        </div>

        <div>
          <Button style={{ marginLeft: "auto" }} type="submit">
            Save
          </Button>
        </div>
      </Stack>
    </Form>
  );
}
