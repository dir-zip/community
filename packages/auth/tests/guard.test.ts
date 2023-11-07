import { GuardBuilder, type TRule } from "../src/guard";
import { AuthorizationError } from "../src/errors";
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("GuardBuilder", () => {
  let guardBuilder: GuardBuilder<string>;

  beforeEach(() => {
    guardBuilder = new GuardBuilder<string>();
  });

  it("initializes with default values", () => {
    expect(guardBuilder.sessionData).toBeUndefined();
    expect(guardBuilder.canAccess).toBe(false);
    expect(guardBuilder["rules"]).toEqual([]);
  });

  describe("createGuards", () => {
    it("adds authorization rules with `can` and `cannot`", async () => {
      const guards = async ({ can, cannot }: any) => {
        can("READ", "resource1");
        cannot("UPDATE", "resource2");
      };

      await guardBuilder.createGuards(guards);

      expect(guardBuilder["rules"]).toEqual([
        {
          can: false,
          ability: "UPDATE",
          resource: "resource2",
          customFunction: undefined,
        },
        {
          can: true,
          ability: "READ",
          resource: "resource1",
          customFunction: undefined,
        },
      ]);
    });

    it("throws an error if an error is thrown inside guards", async () => {
      const guards = async () => {
        throw new Error("Error inside guards");
      };

      await expect(guardBuilder.createGuards(guards)).rejects.toThrowError(
        "Don't throw errors in guard",
      );
    });
  });

  describe("validateGuard", () => {
    it("returns true for a valid guard rule", async () => {
      const guards = async ({ can, cannot }: any) => {
        can("READ", "resource1");
        cannot("UPDATE", "resource2");
      };

      await guardBuilder.createGuards(guards);
      const rule: TRule = ["READ", "resource1"];

      const result = await guardBuilder.validateGuard(rule);

      expect(result).toBe(true);
      expect(guardBuilder.canAccess).toBe(true);
    });

    it("returns validation from a custom function if one is defined", async () => {
      const customFn = vi.fn().mockResolvedValue(false);
      const guards = async ({ can }: any) => {
        can("READ", "resource1", customFn);
      };

      await guardBuilder.createGuards(guards);
      const rule: TRule = ["READ", "resource1"];

      const result = await guardBuilder.validateGuard(rule, 23);

      expect(customFn).toBeCalledWith(23);

      expect(result).toBe(false);
      expect(guardBuilder.canAccess).toBe(false);
    });

    it("returns false for an invalid guard rule", async () => {
      const guards = async ({ can, cannot }: any) => {
        can("READ", "resource1");
        cannot("UPDATE", "resource2");
      };

      await guardBuilder.createGuards(guards);
      const rule: TRule = ["UPDATE", "resource2"];

      const result = await guardBuilder.validateGuard(rule);

      expect(result).toBe(false);
      expect(guardBuilder.canAccess).toBe(false);
    });

    it("presence of the SUPER rule set to all will overwrite any other rules", async () => {
      const guards = async ({ can, cannot }: any) => {
        can("READ", "resource1");
        cannot("UPDATE", "resource2");
        can("SUPER", "all");
      };

      await guardBuilder.createGuards(guards);
      const rule: TRule = ["UPDATE", "resource2"];

      expect(guardBuilder.canAccess).toBe(false);

      const result = await guardBuilder.validateGuard(rule);

      expect(result).toBe(true);
      expect(guardBuilder.canAccess).toBe(true);
    });

    it("returns false for an undefined rule", async () => {
      const guards = async ({ can, cannot }: any) => {
        can("READ", "resource1");
        cannot("UPDATE", "resource2");
      };
      await guardBuilder.createGuards(guards);
      const rule: TRule = ["DELETE", "resource2"];

      const result = await guardBuilder.validateGuard(rule);

      expect(result).toBe(false);
      expect(guardBuilder.canAccess).toBe(false);
    });

    it("returns false if no rules exist", async () => {
      const rule: TRule = ["UPDATE", "resource2"];

      const result = await guardBuilder.validateGuard(rule);

      expect(result).toBe(false);
      expect(guardBuilder.canAccess).toBe(false);
    });
  });

  describe("authorize", () => {
    beforeEach(async () => {
      const guards = async ({ can }: any) => {
        can("READ", "resource1");
        can("UPDATE", "resource2");
      };

      await guardBuilder.createGuards(guards);
    });

    it("throws an AuthorizationError for an invalid guard rule", async () => {
      const rule: TRule = ["DELETE", "resource1"];

      await expect(guardBuilder.authorize(rule)).rejects.toThrowError(
        AuthorizationError,
      );
    });

    it("does not throw an AuthorizationError for a valid guard rule", async () => {
      const rule: TRule = ["UPDATE", "resource2"];

      await expect(guardBuilder.authorize(rule)).resolves.not.toThrowError(
        AuthorizationError,
      );
    });

    // REVIEW: This test exposes a vulnerability with the consistency of the guard authorization
    it("will validate all rules correctly regardless of the order of execution", async () => {
      const rule: TRule = ["UPDATE", "resource2"];

      await expect(guardBuilder.authorize(rule)).resolves.not.toThrowError(
        AuthorizationError,
      );

      const rule2: TRule = ["DELETE", "resource1"];

      await expect(guardBuilder.authorize(rule2)).rejects.toThrowError(
        AuthorizationError,
      );
    });
  });
});
