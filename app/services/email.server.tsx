import { Resend } from "resend"
import type { Email } from "~/models/user.server"
import { renderAsync } from "@react-email/components"
import { type ReactElement } from "react"
import EmailVerificationEmail from "emails/EmailVerificationEmail"
import ResetPasswordEmail from "emails/ResetPasswordEmail"
import WelcomeEmail from "emails/WelcomeEmail"
import type { Password } from "@prisma/client"

const resend = new Resend(ENV.RESEND_API_KEY)

export async function sendPasswordResetEmail(
  email: Email["email"],
  token: NonNullable<Password["passwordResetToken"]>,
) {
  await sendEmail({
    react: <ResetPasswordEmail resetToken={token} />,
    subject: "Reset your password",
    to: email,
  })
}

export async function sendEmailVerificationEmail(
  email: Email["email"],
  token: NonNullable<Email["verificationToken"]>,
) {
  await sendEmail({
    react: <EmailVerificationEmail verificationToken={token} email={email} />,
    subject: "Reset your password",
    to: email,
  })
}

export async function sendWelcomeEmail(
  email: Email["email"],
  token: NonNullable<Email["verificationToken"]>,
) {
  await sendEmail({
    react: <WelcomeEmail verificationToken={token} email={email} />,
    subject: "Welcome to the club!",
    to: email,
  })
}

export async function sendEmail({ react, ...options }: { to: string; subject: string; react: ReactElement }) {
  const from = "Fredagslunchen <hello@fredagslunchen.club>"

  try {
    await resend.emails.send({
      from,
      ...options,
      ...(await renderReactEmail(react)),
    })
  } catch (error) {
    console.log("email error", error)
  }
}

async function renderReactEmail(react: ReactElement) {
  const [html, text] = await Promise.all([renderAsync(react), renderAsync(react, { plainText: true })])
  return { html, text }
}
