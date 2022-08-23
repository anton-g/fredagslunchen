// TODO move to TS, see example at https://github.com/kentcdodds/kentcdodds.com/blob/main/mocks/index.js
const util = require("util")
const { rest } = require("msw")
const { setupServer } = require("msw/node")
const { isE2E, updateFixture } = require("./utils")

const handlers = [
  rest.post("https://api.sendgrid.com/v3/mail/send", async (req, res, ctx) => {
    const body = req.body
    console.info(
      "🔶 mocked email contents:",
      util.inspect(body, false, null, true)
    )

    if (isE2E && body.from) {
      await updateFixture({ email: body })
    }

    ctx.status(202)
    return res(ctx.json(""))
  }),
]

const server = setupServer(...handlers)

server.listen({ onUnhandledRequest: "bypass" })
console.info("🔶 Mock server running")

process.once("SIGINT", () => server.close())
process.once("SIGTERM", () => server.close())
