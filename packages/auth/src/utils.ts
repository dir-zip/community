import { nanoid } from "nanoid";
import * as crypto from "crypto";
import { type Driver, type Data } from "./types";
import { fromBase64, toBase64 } from "b64-lite";
import {
  TOKEN_SEPARATOR,
  HANDLE_SEPARATOR,
  MIN_TOKEN_LENGTH,
} from "./constants";

export const generateToken = (numberOfCharacters = 32) => {
  if (numberOfCharacters < MIN_TOKEN_LENGTH) {
    throw new Error("Token length specified is too short");
  }
  return nanoid(numberOfCharacters);
};
export const hash256 = (input = "") => {
  return crypto.createHash("sha256").update(input).digest("hex");
};
export const createdataToken = (data: string | Data<null>) => {
  const payload = typeof data === "string" ? data : JSON.stringify(data);
  return toBase64(payload);
};

export const createAntiCSRFToken = () => {
  return generateToken(32);
};

export const generateSessionId = () => {
  return generateToken(32) + HANDLE_SEPARATOR;
};

export const createSessionToken = <T>(id: string, data: Data<T>) => {
  const dataString = JSON.stringify(data);
  return toBase64(
    [id, generateToken(32), hash256(dataString)].join(TOKEN_SEPARATOR),
  );
};

export const parseSessionToken = (token: string) => {
  // REVIEW: The generated token here is ignored as this function only returns
  // the id and hashedData ignoring the generated token but may be useful to
  // return entire parsed string contents
  const [id, _, hashedData] = fromBase64(token).split(TOKEN_SEPARATOR);

  if (!id || !hashedData) {
    throw new Error("Failed to parse session token");
  }

  return {
    id,
    hashedData,
  };
};

export function checkDriverInterface<T>(driver?: Driver<T>): boolean {
  return !!(
    driver &&
    typeof driver.store === "function" &&
    typeof driver.update === "function" &&
    typeof driver.get === "function" &&
    typeof driver.delete === "function"
  );
}
