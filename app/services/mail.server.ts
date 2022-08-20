import type { Email, User } from "@prisma/client"
import sgMail from "@sendgrid/mail"

if (ENV.SENDGRID_API_KEY) sgMail.setApiKey(ENV.SENDGRID_API_KEY)

export async function sendPasswordResetEmail(
  email: Email["email"],
  token: NonNullable<User["passwordResetToken"]>
) {
  if (!ENV.SENDGRID_API_KEY) {
    console.log(
      `Missing Sendgrid API Key. Ignoring password reset email: ${email} - ${token}`
    )
    return
  }

  const msg = {
    to: email,
    from: { email: "info@fredagslunchen.club", name: "Fredagslunchen" },
    templateId: "d-f041adf649d942beb0b0654d81515e9d",
    dynamicTemplateData: {
      link: `https://fredagslunchen.club/reset-password?token=${token}`,
    },
  }

  await sgMail.send(msg).catch((error) => console.error(error))
}
