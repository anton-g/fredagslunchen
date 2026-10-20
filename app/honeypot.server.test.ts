import { Honeypot, SpamError } from "./honeypot.server"

function formDataFrom(entries: Record<string, string>) {
  let formData = new FormData()
  for (let [key, value] of Object.entries(entries)) formData.set(key, value)
  return formData
}

describe("Honeypot", () => {
  let honeypot: Honeypot

  beforeEach(() => {
    vi.useFakeTimers()
    honeypot = new Honeypot({ encryptionSeed: "secret", minFillDuration: 3000, maxAge: 60_000 })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function validFormData() {
    let props = honeypot.getInputProps()
    return formDataFrom({
      [props.nameFieldName]: "",
      [props.validFromFieldName!]: props.encryptedValidFrom,
    })
  }

  test("accepts a properly filled form", () => {
    let formData = validFormData()
    vi.advanceTimersByTime(5000)
    expect(() => honeypot.check(formData)).not.toThrow()
  })

  test("rejects a form without honeypot inputs", () => {
    expect(() => honeypot.check(formDataFrom({ email: "bot@example.com" }))).toThrow(SpamError)
  })

  test("rejects a filled honeypot input", () => {
    let formData = validFormData()
    formData.set("name__confirm", "bot")
    vi.advanceTimersByTime(5000)
    expect(() => honeypot.check(formData)).toThrow("Honeypot input not empty")
  })

  test("rejects a form submitted too fast", () => {
    let formData = validFormData()
    vi.advanceTimersByTime(1000)
    expect(() => honeypot.check(formData)).toThrow("Form submitted too fast")
  })

  test("rejects an expired form", () => {
    let formData = validFormData()
    vi.advanceTimersByTime(120_000)
    expect(() => honeypot.check(formData)).toThrow("Honeypot valid from has expired")
  })

  test("rejects a tampered valid from value", () => {
    let formData = validFormData()
    formData.set("from__confirm", "garbage")
    vi.advanceTimersByTime(5000)
    expect(() => honeypot.check(formData)).toThrow(SpamError)
  })
})
