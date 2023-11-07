import { describe, it, expect } from "vitest";
import {
  hash256,
  generateSessionId,
  generateToken,
  createAntiCSRFToken,
  createSessionToken,
  createdataToken,
  parseSessionToken,
  checkDriverInterface,
} from "../src/utils";
import {
  HANDLE_SEPARATOR,
  MIN_TOKEN_LENGTH,
  TOKEN_SEPARATOR,
} from "../src/constants";
import { type Driver } from "../src/types";

describe("Utils", () => {
  describe("generate token", () => {
    it("should not allow generating tokens of length smaller than the set minimum", () => {
      const smallTokenLength = MIN_TOKEN_LENGTH - 1;
      expect(() => generateToken(smallTokenLength)).toThrowError(
        "Token length specified is too short",
      );
    });

    it("generates a token of the specified length", () => {
      const min = MIN_TOKEN_LENGTH;
      const max = 60;
      const tokenLength = Math.floor(Math.random() * (max - min + 1)) + min;
      const token = generateToken(tokenLength);
      expect(token.length).toBe(tokenLength);
    });

    it("generates a default token of length 32 if no length is specified", () => {
      const token = generateToken();
      expect(token.length).toBe(32);
    });
  });

  describe("hash256", () => {
    it("hashes an empty string", () => {
      const hashed = hash256("");
      expect(hashed).toMatch(/^[a-fA-F0-9]{64}$/);
    });

    it("hashes a non-empty string", () => {
      const hashed = hash256("Hello, World!");
      expect(hashed).toMatch(/^[a-fA-F0-9]{64}$/);
    });
  });

  describe("createAntiCSRFToken", () => {
    it("creates an Anti-CSRF token of length 32", () => {
      const token = createAntiCSRFToken();
      expect(token.length).toBe(32);
    });
  });

  describe("generateSessionId", () => {
    it("generates a session ID with the specified length", () => {
      const sessionId = generateSessionId();
      expect(sessionId.length).toBe(32 + 1); // Length of token + HANDLE_SEPARATOR
    });

    it("always adds the handle seperator as the last character for the session ID", () => {
      const sessionId = generateSessionId();
      expect(sessionId[sessionId.length - 1]).toBe(HANDLE_SEPARATOR);
    });
  });

  describe("createSessionToken", () => {
    it("creates a session token with the specified ID and data", () => {
      const id = "session_id";
      const data = { userId: "john_doe" };
      const token = createSessionToken(id, data);
      const decodedToken = Buffer.from(token, "base64").toString("ascii");
      const [decodedId, _, hashedData] = decodedToken.split(TOKEN_SEPARATOR);

      expect(decodedId).toBe(id);
      expect(hashedData).toMatch(/^[a-fA-F0-9]{64}$/);
    });
  });

  describe("createDataToken", () => {
    it("creates a data token from a string", () => {
      const data = "example";
      const token = createdataToken(data);
      expect(token).toBe("ZXhhbXBsZQ==");
    });

    it("creates a data token from an object", () => {
      const data = { userId: "value" };
      const token = createdataToken(data);
      expect(token).toBe("eyJ1c2VySWQiOiJ2YWx1ZSJ9");
    });
  });

  describe("parseSessionToken", () => {
    it("parses a valid session token", () => {
      const id = "session_id";
      const data = { userId: "john_doe" };
      const hashedData = hash256(JSON.stringify(data));
      const token = createSessionToken(id, data);

      const parsed = parseSessionToken(token);
      expect(parsed.id).toBe(id);
      expect(parsed.hashedData).toBe(hashedData);
    });

    it("throws an error for an invalid session token", () => {
      const token = "invalid_token";
      expect(() => parseSessionToken(token)).toThrowError(
        "Failed to parse session token",
      );
    });
  });

  describe("schema validations", () => {
    describe("CheckDriverInterface", () => {
      it("will return false for the wrong interface", () => {
        const emptyDriver: Driver<string> = {} as any;

        const result = checkDriverInterface(emptyDriver);

        expect(result).toBe(false);
      });

      it("will return true for the correct interface", () => {
        const validDriver: Driver<string> = {
          store: () => Promise.resolve(),
          update: () => Promise.resolve(),
          get: () => Promise.resolve(),
          delete: () => Promise.resolve(),
        };

        const result = checkDriverInterface(validDriver);

        expect(result).toBe(true);
      });
    });
  });
});
