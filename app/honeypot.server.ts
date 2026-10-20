import CryptoJS from "crypto-js"

export interface HoneypotInputProps {
  nameFieldName: string
  validFromFieldName: string | null
  encryptedValidFrom: string
}

export interface HoneypotConfig {
  randomizeNameFieldName?: boolean
  nameFieldName?: string
  validFromFieldName?: string | null
  encryptionSeed?: string
  /** Minimum time in ms between rendering the form and submitting it */
  minFillDuration?: number
  /** Maximum time in ms a rendered form stays valid, prevents replaying a harvested token */
  maxAge?: number
}

export class SpamError extends Error {}

const DEFAULT_NAME_FIELD_NAME = "name__confirm"
const DEFAULT_VALID_FROM_FIELD_NAME = "from__confirm"

export class Honeypot {
  private generatedEncryptionSeed = this.randomValue()

  constructor(protected config: HoneypotConfig = {}) {}

  public getInputProps({ validFromTimestamp = Date.now() } = {}): HoneypotInputProps {
    return {
      nameFieldName: this.nameFieldName,
      validFromFieldName: this.validFromFieldName,
      encryptedValidFrom: this.encrypt(validFromTimestamp.toString()),
    }
  }

  public check(formData: FormData) {
    let nameFieldName = this.config.nameFieldName ?? DEFAULT_NAME_FIELD_NAME
    if (this.config.randomizeNameFieldName) {
      let actualName = this.getRandomizedNameFieldName(nameFieldName, formData)
      if (actualName) nameFieldName = actualName
    }

    if (!formData.has(nameFieldName)) {
      throw new SpamError("Missing honeypot input")
    }

    let honeypotValue = formData.get(nameFieldName)

    if (honeypotValue !== "") throw new SpamError("Honeypot input not empty")
    if (!this.validFromFieldName) return

    let validFrom = formData.get(this.validFromFieldName)

    if (!validFrom) throw new SpamError("Missing honeypot valid from input")

    let time = this.decrypt(validFrom as string)
    if (!time) throw new SpamError("Invalid honeypot valid from input")
    if (!this.isValidTimeStamp(Number(time))) {
      throw new SpamError("Invalid honeypot valid from input")
    }

    if (this.isFuture(Number(time))) {
      throw new SpamError("Honeypot valid from is in future")
    }

    let elapsed = Date.now() - Number(time)
    if (this.config.minFillDuration && elapsed < this.config.minFillDuration) {
      throw new SpamError("Form submitted too fast")
    }

    if (this.config.maxAge && elapsed > this.config.maxAge) {
      throw new SpamError("Honeypot valid from has expired")
    }
  }

  protected get nameFieldName() {
    let fieldName = this.config.nameFieldName ?? DEFAULT_NAME_FIELD_NAME
    if (!this.config.randomizeNameFieldName) return fieldName
    return `${fieldName}_${this.randomValue()}`
  }

  protected get validFromFieldName() {
    if (this.config.validFromFieldName === undefined) {
      return DEFAULT_VALID_FROM_FIELD_NAME
    }
    return this.config.validFromFieldName
  }

  protected get encryptionSeed() {
    return this.config.encryptionSeed ?? this.generatedEncryptionSeed
  }

  protected getRandomizedNameFieldName(nameFieldName: string, formData: FormData): string | undefined {
    for (let key of formData.keys()) {
      if (!key.startsWith(nameFieldName)) continue
      return key
    }
  }

  protected randomValue() {
    return CryptoJS.lib.WordArray.random(128 / 8).toString()
  }

  protected encrypt(value: string) {
    return CryptoJS.AES.encrypt(value, this.encryptionSeed).toString()
  }

  protected decrypt(value: string) {
    try {
      return CryptoJS.AES.decrypt(value, this.encryptionSeed).toString(CryptoJS.enc.Utf8)
    } catch {
      return ""
    }
  }

  protected isFuture(timestamp: number) {
    return timestamp > Date.now()
  }

  protected isValidTimeStamp(timestampp: number) {
    if (Number.isNaN(timestampp)) return false
    if (timestampp <= 0) return false
    if (timestampp >= Number.MAX_SAFE_INTEGER) return false
    return true
  }
}

export const honeypot = new Honeypot({
  validFromFieldName: process.env.TESTING ? null : undefined,
  encryptionSeed: process.env.HONEYPOT_SECRET,
  minFillDuration: 3 * 1000,
  maxAge: 24 * 60 * 60 * 1000,
})

export function checkHoneypot(formData: FormData) {
  try {
    honeypot.check(formData)
  } catch (error) {
    if (error instanceof SpamError) {
      throw new Response("Form not submitted properly", { status: 400 })
    }
    throw error
  }
}
