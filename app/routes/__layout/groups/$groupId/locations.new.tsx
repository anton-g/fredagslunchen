import type { Prisma } from "@prisma/client";
import type { ActionFunction, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { useEffect, useRef } from "react";
import invariant from "tiny-invariant";
import { Button } from "~/components/Button";
import { ComboBox, Item, Label } from "~/components/ComboBox";
import { Input } from "~/components/Input";
import { Stack } from "~/components/Stack";
import { getGroup } from "~/models/group.server";

import { createGroupLocation, getAllLocations } from "~/models/location.server";
import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireUserId(request);
  invariant(params.groupId, "groupId not found");

  const group = await getGroup({ userId, id: params.groupId });
  if (!group) {
    throw new Response("Not Found", { status: 404 });
  }

  const locations = await getAllLocations();

  return json({ group, locations });
};

type ActionData = {
  errors?: {
    name?: string;
    address?: string;
    lat?: string;
    lon?: string;
    discoveredBy?: string;
  };
};

export const action: ActionFunction = async ({ request, params }) => {
  await requireUserId(request);

  const formData = await request.formData();
  const locationId = formData.get("location-key");
  const name = formData.get("location");
  const address = formData.get("address");
  const lat = formData.get("lat");
  const lon = formData.get("lon");
  const discoveredById = formData.get("discoveredBy-key");
  const groupId = params.groupId;
  invariant(groupId, "groupId not found");

  if (typeof name !== "string" || name.length === 0) {
    return json<ActionData>(
      { errors: { name: "Name is required" } },
      { status: 400 }
    );
  }

  if (typeof address !== "string" || address.length === 0) {
    return json<ActionData>(
      { errors: { address: "Address is required" } },
      { status: 400 }
    );
  }

  if (typeof lat !== "string" || lat.length === 0) {
    return json<ActionData>(
      { errors: { lat: "Latitude is required" } },
      { status: 400 }
    );
  }

  if (typeof lon !== "string" || lon.length === 0) {
    return json<ActionData>(
      { errors: { lon: "Longitude is required" } },
      { status: 400 }
    );
  }

  if (typeof discoveredById !== "string" || discoveredById.length === 0) {
    return json<ActionData>(
      { errors: { discoveredBy: "Discovered by is required" } },
      { status: 400 }
    );
  }

  const parsedId =
    locationId && typeof locationId === "string"
      ? parseInt(locationId)
      : undefined;

  const location = await createGroupLocation({
    groupId,
    name,
    address,
    lat,
    lon,
    discoveredById,
    locationId: parsedId,
  });

  return redirect(`/groups/${groupId}/locations/${location.locationId}`);
};

export default function NewLunchPage() {
  const user = useUser();
  const actionData = useActionData() as ActionData;
  const loaderData = useLoaderData<typeof loader>();
  const nameRef = useRef<HTMLInputElement>(null!);
  const addressRef = useRef<HTMLInputElement>(null);
  const latRef = useRef<HTMLInputElement>(null);
  const lonRef = useRef<HTMLInputElement>(null);
  const discoveredByRef = useRef<HTMLInputElement>(null!);

  useEffect(() => {
    if (actionData?.errors?.name) {
      nameRef.current?.focus();
    } else if (actionData?.errors?.address) {
      addressRef.current?.focus();
    } else if (actionData?.errors?.lat) {
      latRef.current?.focus();
    } else if (actionData?.errors?.lon) {
      lonRef.current?.focus();
    } else if (actionData?.errors?.discoveredBy) {
      discoveredByRef.current?.focus();
    }
  }, [actionData]);

  const locations = loaderData.locations.filter(
    (l) => !loaderData.group.groupLocations.find((gl) => gl.locationId === l.id)
  );

  const members = loaderData.group.members.map((x) => ({
    id: x.userId,
    name: x.user.name,
  }));

  return (
    <>
      <h3>New location</h3>
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
            <ComboBox
              label="Name"
              name="location"
              defaultItems={locations}
              defaultSelectedKey={user.id}
              inputRef={nameRef}
              allowsCustomValue={true}
            >
              {(item) => (
                <Item textValue={item.name}>
                  <div>
                    <Label>{item.name}</Label>
                  </div>
                </Item>
              )}
            </ComboBox>
            {actionData?.errors?.name && (
              <div id="name-error">{actionData.errors.name}</div>
            )}
          </div>

          <div>
            <label>
              <span>Address</span>
              <Input
                ref={addressRef}
                name="address"
                aria-invalid={actionData?.errors?.address ? true : undefined}
                aria-errormessage={
                  actionData?.errors?.address ? "address-error" : undefined
                }
              />
            </label>
            {actionData?.errors?.address && (
              <div id="address-error">{actionData.errors.address}</div>
            )}
          </div>

          <div style={{ display: "flex", width: "100%", gap: 16 }}>
            <div style={{ width: "100%" }}>
              <label>
                <span>Latitude</span>
                <Input
                  ref={latRef}
                  name="lat"
                  aria-invalid={actionData?.errors?.lat ? true : undefined}
                  aria-errormessage={
                    actionData?.errors?.lat ? "lat-error" : undefined
                  }
                />
              </label>
              {actionData?.errors?.lat && (
                <div id="lat-error">{actionData.errors.lat}</div>
              )}
            </div>

            <div style={{ width: "100%" }}>
              <label>
                <span>Longitude</span>
                <Input
                  ref={lonRef}
                  name="lon"
                  aria-invalid={actionData?.errors?.lon ? true : undefined}
                  aria-errormessage={
                    actionData?.errors?.lon ? "lon-error" : undefined
                  }
                />
              </label>
              {actionData?.errors?.lon && (
                <div id="lon-error">{actionData.errors.lon}</div>
              )}
            </div>
          </div>

          <div>
            <ComboBox
              label="Discovered by"
              name="discoveredBy"
              defaultItems={members}
              defaultSelectedKey={user.id}
              inputRef={discoveredByRef}
            >
              {(item) => (
                <Item textValue={item.name}>
                  <div>
                    <Label>{item.name}</Label>
                  </div>
                </Item>
              )}
            </ComboBox>
            {actionData?.errors?.discoveredBy && (
              <div id="discoveredBy-error">
                {actionData.errors.discoveredBy}
              </div>
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
