import * as E from "@react-email/components"
import { EmailLogo, EmailRoot } from "./EmailComponents"

export default function ResetPasswordEmail({ resetToken }: { resetToken: string }) {
  return (
    <EmailRoot title="Reset your password">
      <E.Container>
        <EmailLogo />
        <E.Heading mb="0">Reset your password</E.Heading>
        <E.Text style={{ marginTop: 0 }}>
          Click the link below to reset your password. The link will expire after 10 minutes.
        </E.Text>
        <E.Button
          pY={4}
          pX={8}
          href={`https://fredagslunchen.club/reset-password?token=${resetToken}`}
          className="button"
        >
          Reset password
        </E.Button>
      </E.Container>
    </EmailRoot>
  )
}
