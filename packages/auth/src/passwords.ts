import * as crypto from "crypto"

export const PasswordHandler = {
  salt: (globalThis as any).secret || process.env.SESSION_SECRET,
  async hash(password: string) {
    const hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, "sha512").toString("hex")
    return hash
  },
  async verify(password: string, hashedPassword: string) {
    const hashVerify = crypto.pbkdf2Sync(password, this.salt, 1000, 64, "sha512").toString("hex")
    return hashedPassword === hashVerify
  }
}