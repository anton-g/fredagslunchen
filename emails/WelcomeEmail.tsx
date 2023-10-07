import * as E from "@react-email/components"
import { EmailLogo, EmailRoot } from "./EmailComponents"

export default function WelcomeEmail({
  verificationToken,
  email,
}: {
  verificationToken: string
  email: string
}) {
  return (
    <EmailRoot title="Welcome to the club!">
      <E.Container>
        <EmailLogo />
        <E.Heading mb="0" style={{ color: "#000000" }}>
          Welcome to the club!
        </E.Heading>
        <E.Text style={{ marginTop: 0, color: "#000000" }}>
          Confirm your email ({email}) by clicking the button below and start tracking your lunches!
        </E.Text>
        <E.Button
          pY={4}
          pX={8}
          href={`https://fredagslunchen.club/verify-email?token=${verificationToken}`}
          className="button"
        >
          Confirm email
        </E.Button>
      </E.Container>
    </EmailRoot>
  )
}
