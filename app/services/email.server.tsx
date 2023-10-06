import { Resend } from "resend"
import type { Email, User } from "~/models/user.server"
import { renderAsync } from "@react-email/components"
import { type ReactElement } from "react"
import EmailVerificationEmail from "emails/EmailVerificationEmail"
import ResetPasswordEmail from "emails/ResetPasswordEmail"

const resend = new Resend(ENV.RESEND_API_KEY)

export async function sendPasswordResetEmail(
  email: Email["email"],
  token: NonNullable<User["passwordResetToken"]>,
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

export async function sendEmail({ react, ...options }: { to: string; subject: string; react: ReactElement }) {
  const from = "hello@fredagslunchen.club"

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
