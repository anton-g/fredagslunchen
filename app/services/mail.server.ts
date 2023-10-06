import type { Email, User } from "~/models/user.server"
import sgMail from "@sendgrid/mail"

if (ENV.SENDGRID_API_KEY) sgMail.setApiKey(ENV.SENDGRID_API_KEY)

export async function sendPasswordResetEmail(
  email: Email["email"],
  token: NonNullable<User["passwordResetToken"]>
) {
  await sendEmail({
    email,
    templateId: "d-f041adf649d942beb0b0654d81515e9d",
    dynamicData: {
      link: `https://fredagslunchen.club/reset-password?token=${token}`,
    },
  })
}

export async function sendEmailVerificationEmail(
  email: Email["email"],
  token: NonNullable<Email["verificationToken"]>
) {
  await sendEmail({
    email,
    templateId: "d-8b2ce7a33a004d8683491bea32a5f8cb",
    dynamicData: {
      link: `https://fredagslunchen.club/verify-email?token=${token}`,
    },
  })
}

const sendEmail = async ({
  email,
  templateId,
  dynamicData,
}: {
  email: string
  templateId: string
  dynamicData: Record<string, any>
}) => {
  if (!ENV.SENDGRID_API_KEY) {
    console.warn(`Missing Sendgrid API Key. Ignoring email: ${email} - ${templateId}`)
    return
  }

  const msg: sgMail.MailDataRequired = {
    to: email,
    from: { email: "info@fredagslunchen.club", name: "Fredagslunchen" }, // TODO move to config/env
    templateId,
    dynamicTemplateData: dynamicData,
  }

  await sgMail
    .send(msg)
    .then(
      (x) => console.log(x),
      (x) => console.log(x)
    )
    .catch((error) => console.error(error))
}
