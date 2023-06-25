import { useFetcher } from "@remix-run/react"
import type { Group } from "~/models/group.server"
import styled from "styled-components"
import { Spacer } from "~/components/Spacer"
import { Button, LoadingButton } from "~/components/Button"
import { useEffect, useState } from "react"
import { useRef } from "react"
import { Dialog } from "~/components/Dialog"
import { Input } from "~/components/Input"

export const CreateAnonymousUserButton = ({ groupId }: { groupId: Group["id"] }) => {
  const [isOpen, setIsOpen] = useState(false)
  const fetcher = useFetcher()
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const errors = fetcher.data?.errors
    if (errors?.name) {
      nameRef.current?.focus()
    }
  }, [fetcher])

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.ok) {
      setIsOpen(false)
    }
  }, [fetcher])

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Trigger asChild>
          <Button>Create anonymous user</Button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Close />
          <Dialog.Title>Create anonymous user</Dialog.Title>
          <DialogDescription>
            <p>Anonymous users are users without an account.</p>
            <p>
              They are perfect for your friend that doesn't have a computer, your lazy boss or anyone else
              that still want to follow along on your lunch journeys without a Fredagslunchen account.
            </p>
            <p>
              You can transfer the anonymous users data to them if they decide to create an account later on.
            </p>
          </DialogDescription>
          <fetcher.Form method="post" action="/api/users/create-anonymous">
            <input type="hidden" name="groupId" value={groupId} />
            <label>
              <span>Name</span>
              <Input
                id="name"
                name="name"
                required
                ref={nameRef}
                aria-invalid={fetcher.data?.errors?.name ? true : undefined}
                aria-errormessage={fetcher.data?.errors?.name ? "name-error" : undefined}
              />
            </label>
            {fetcher.data?.errors?.name && <div id="name-error">{fetcher.data.errors.name}</div>}
            <Spacer size={16} />
            <LoadingButton loading={fetcher.state !== "idle"} size="large" style={{ marginLeft: "auto" }}>
              Create anonymous user
            </LoadingButton>
          </fetcher.Form>
        </Dialog.Content>
      </Dialog>
    </>
  )
}
const DialogDescription = styled(Dialog.Description)`
  > p {
    margin: 0;
    margin-bottom: 16px;
  }
`
