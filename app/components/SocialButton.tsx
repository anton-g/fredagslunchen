import { Form, useSearchParams } from "@remix-run/react"
import { Button } from "~/components/Button"

export const SocialButton = ({
  provider,
  label,
  from,
}: {
  provider: "google"
  label: string
  from: "login" | "join"
}) => {
  const [searchParams] = useSearchParams()

  return (
    <Form action={`/auth/${provider}?${searchParams.toString()}&from=${from}`} method="post">
      <Button size="large">{label}</Button>
    </Form>
  )
}
