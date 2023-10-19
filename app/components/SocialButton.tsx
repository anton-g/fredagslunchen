import { Form, useSearchParams } from "@remix-run/react"
import { Button } from "~/components/Button"
import type { SocialsProvider } from "remix-auth-socials"

export const SocialButton = ({ provider, label }: { provider: SocialsProvider; label: string }) => {
  const [searchParams] = useSearchParams()

  return (
    <Form action={`/auth/${provider}?${searchParams.toString()}`} method="post">
      <Button size="large">{label}</Button>
    </Form>
  )
}
