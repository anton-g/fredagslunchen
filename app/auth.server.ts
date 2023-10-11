import { Authenticator, AuthorizationError } from "remix-auth"
import { sessionStorage } from "~/session.server"
import { FormStrategy } from "remix-auth-form"
import { verifyLogin } from "./models/user.server"
import invariant from "tiny-invariant"

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export const authenticator = new Authenticator<string>(sessionStorage, {
  sessionKey: "userId",
})

// Tell the Authenticator to use the form strategy
authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get("email")
    const password = form.get("password")

    invariant(typeof email === "string", "email must be a string")
    invariant(email.length > 0, "email must not be empty")

    invariant(typeof password === "string", "password must be a string")
    invariant(password.length > 0, "password must not be empty")

    const user = await verifyLogin(email, password)

    if (!user) throw new AuthorizationError("Invalid email or password")

    return user.id
  }),
  // each strategy has a name and can be changed to use another one
  // same strategy multiple times, especially useful for the OAuth2 strategy.
  "user-pass",
)
