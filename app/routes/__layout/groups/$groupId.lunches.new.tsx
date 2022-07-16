import type { Prisma } from "@prisma/client";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import * as React from "react";
import invariant from "tiny-invariant";
import { Button } from "~/components/Button";
import { ComboBox, Description, Item, Label } from "~/components/ComboBox";
import { Input } from "~/components/Input";
import { Stack } from "~/components/Stack";
import { getGroup } from "~/models/group.server";

import { createLunch } from "~/models/lunch.server";
import { requireUserId } from "~/session.server";
import type { RecursivelyConvertDatesToStrings } from "~/utils";
import { useUser } from "~/utils";

type LoaderData = {
  group: NonNullable<Prisma.PromiseReturnType<typeof getGroup>>;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.groupId, "groupId not found");

  const group = await getGroup({ userId, id: params.groupId });
  if (!group) {
    throw new Response("Not Found", { status: 404 });
  }
  return json<LoaderData>({ group });
};

type ActionData = {
  errors?: {
    date?: string;
    choosenById?: string;
    locationId?: string;
  };
};

export const action: ActionFunction = async ({ request, params }) => {
  await requireUserId(request);

  const formData = await request.formData();
  const date = formData.get("date");
  const locationId = formData.get("location-key");
  const choosenById = formData.get("choosenBy-key");
  const groupId = params.groupId;
  invariant(groupId, "groupId not found");

  // TODO handle all errors
  if (typeof date !== "string" || date.length === 0) {
    return json<ActionData>(
      { errors: { date: "Date is required" } },
      { status: 400 }
    );
  }

  if (typeof locationId !== "string" || locationId.length === 0) {
    return json<ActionData>(
      { errors: { locationId: "Location is required" } },
      { status: 400 }
    );
  }

  if (typeof choosenById !== "string" || choosenById.length === 0) {
    return json<ActionData>(
      { errors: { choosenById: "Choosen by is required" } },
      { status: 400 }
    );
  }

  const lunch = await createLunch({
    choosenByUserId: choosenById,
    date: date,
    locationId: parseInt(locationId),
    groupId,
  });

  return redirect(`/groups/${groupId}/lunches/${lunch.id}`);
};

export default function NewLunchPage() {
  const user = useUser();
  const actionData = useActionData() as ActionData;
  const loaderData =
    useLoaderData() as RecursivelyConvertDatesToStrings<LoaderData>;
  const choosenByRef = React.useRef<HTMLInputElement>(null);
  const locationRef = React.useRef<HTMLInputElement>(null);
  const dateRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.date) {
      dateRef.current?.focus();
    } else if (actionData?.errors?.locationId) {
      locationRef.current?.focus();
    } else if (actionData?.errors?.choosenById) {
      choosenByRef.current?.focus();
    }
  }, [actionData]);

  const locations = loaderData.group.groupLocations.map((x) => ({
    id: x.locationId,
    name: x.location.name,
  }));

  const users = loaderData.group.users.map((x) => ({
    id: x.userId,
    name: x.user.name,
  }));

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
          <ComboBox label="Location" defaultItems={locations} name="location">
            {(item) => (
              <Item textValue={item.name}>
                <div>
                  <Label>{item.name}</Label>
                  <Description>foo</Description>
                </div>
              </Item>
            )}
          </ComboBox>
          {actionData?.errors?.locationId && (
            <div id="location-error">{actionData.errors.locationId}</div>
          )}
        </div>

        <div>
          <ComboBox
            label="Choosen by"
            name="choosenBy"
            defaultItems={users}
            defaultSelectedKey={user.id}
          >
            {(item) => (
              <Item textValue={item.name}>
                <div>
                  <Label>{item.name}</Label>
                  <Description>foo</Description>
                </div>
              </Item>
            )}
          </ComboBox>
          {actionData?.errors?.choosenById && (
            <div id="choosenBy-error">{actionData.errors.choosenById}</div>
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
