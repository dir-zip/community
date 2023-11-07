import { describe, it, expect, vi } from "vitest";
import {
  AllowedProviders,
  getEmailFromCallback,
  githubCallbackUrl,
  googleCallbackUrl,
} from "../src/oauth";

const mockFetch = (data: any) => async () => {
  if (data) {
    return {
      json: () => Promise.resolve(data),
    };
  }
  return {
    json: () => Promise.reject(null),
  };
};

describe("oauth.tsx", () => {
  describe("AllowedProviders", () => {
    it("should contain allowed provider names", () => {
      expect(AllowedProviders).toEqual(["github", "google"]);
    });
  });

  describe("getEmailFromCallback", () => {
    it("should throw an error if callback is missing", async () => {
      const code = "abc123";
      const callback: string[] = undefined as any;
      const oauthCredentials = {
        providers: {
          github: {
            clientId: "githubClientId",
            clientSecret: "githubClientSecret",
          },
          google: {
            clientId: "googleClientId",
            clientSecret: "googleClientSecret",
          },
        },
        baseUrl: "https://example.com",
      };

      await expect(() =>
        getEmailFromCallback({ code, callback }, oauthCredentials),
      ).rejects.toThrowError("No callback in query params");
    });

    it("should throw an error if provider is invalid", async () => {
      const code = "abc123";
      const callback = ["invalidProvider"];
      const oauthCredentials = {
        providers: {
          github: {
            clientId: "githubClientId",
            clientSecret: "githubClientSecret",
          },
          google: {
            clientId: "googleClientId",
            clientSecret: "googleClientSecret",
          },
        },
        baseUrl: "https://example.com",
      };

      await expect(() =>
        getEmailFromCallback({ code, callback }, oauthCredentials),
      ).rejects.toThrowError("Invalid provider");
    });

    it("should return email and provider for GitHub", async () => {
      const code = "abc123";
      const callback = ["github"];
      const oauthCredentials = {
        providers: {
          github: {
            clientId: "githubClientId",
            clientSecret: "githubClientSecret",
          },
          google: {
            clientId: "googleClientId",
            clientSecret: "googleClientSecret",
          },
        },
        baseUrl: "https://example.com",
      };

      // Mock fetch responses
      const mockFetchToken = mockFetch({ access_token: "githubAccessToken" });
      const mockFetchEmails = mockFetch([
        { primary: true, email: "test@example.com" },
      ]);

      global.fetch = vi
        .fn()
        .mockImplementationOnce(mockFetchToken)
        .mockImplementationOnce(mockFetchEmails);

      const result = await getEmailFromCallback(
        { code, callback },
        oauthCredentials,
      );

      expect(result).toEqual({ email: "test@example.com", provider: "github" });
      expect(global.fetch).toBeCalledTimes(2);
      expect(global.fetch).toHaveBeenNthCalledWith(
        1,
        "https://github.com/login/oauth/access_token",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: expect.any(String),
        }),
      );
      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        "https://api.github.com/user/emails",
        expect.objectContaining({
          headers: {
            Authorization: "token githubAccessToken",
          },
        }),
      );
    });

    it("should return email and provider for Google", async () => {
      const code = "abc123";
      const callback = ["google"];
      const oauthCredentials = {
        providers: {
          github: {
            clientId: "githubClientId",
            clientSecret: "githubClientSecret",
          },
          google: {
            clientId: "googleClientId",
            clientSecret: "googleClientSecret",
          },
        },
        baseUrl: "https://example.com",
      };

      // Mock fetch responses
      const mockFetchToken = mockFetch({ access_token: "googleAccessToken" });
      const mockFetchUserInfo = mockFetch({ email: "test@example.com" });

      global.fetch = vi
        .fn()
        .mockImplementationOnce(mockFetchToken)
        .mockImplementationOnce(mockFetchUserInfo);

      const result = await getEmailFromCallback(
        { code, callback },
        oauthCredentials,
      );

      expect(result).toEqual({ email: "test@example.com", provider: "google" });
      expect(global.fetch).toBeCalledTimes(2);
      expect(global.fetch).toHaveBeenNthCalledWith(
        1,
        "https://oauth2.googleapis.com/token",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: expect.any(String),
        }),
      );
      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        "https://www.googleapis.com/oauth2/v2/userinfo",
        expect.objectContaining({
          headers: {
            Authorization: "Bearer googleAccessToken",
          },
        }),
      );
    });
  });

  describe("githubCallbackUrl", () => {
    it("should generate the correct GitHub callback URL", () => {
      const clientId = "githubClientId";
      const baseUrl = "https://example.com";

      const expectedUrl =
        "http://github.com/login/oauth/authorize?client_id=githubClientId&redirect_uri=https://example.com/api/auth/github&scope=user";

      const url = githubCallbackUrl({ clientId, baseUrl });

      expect(url).toEqual(expectedUrl);
    });
  });

  describe("googleCallbackUrl", () => {
    it("should generate the correct Google callback URL", () => {
      const clientId = "googleClientId";
      const baseUrl = "https://example.com";

      const expectedUrl =
        "https://accounts.google.com/o/oauth2/v2/auth?client_id=googleClientId&redirect_uri=https://example.com/api/auth/google&scope=profile email&response_type=code";

      const url = googleCallbackUrl({ clientId, baseUrl });

      expect(url).toEqual(expectedUrl);
    });
  });
});
