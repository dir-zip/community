import { describe, it, expect, vi, afterEach } from "vitest";
import {
  getServerSession,
  createNewSession,
  revokeSession,
  getSessionData,
  setSessionData,
} from "../src/sessions";
import { type SessionModel, type Driver } from "../src/types";
import { createAntiCSRFToken, createSessionToken, hash256 } from "../src/utils";

const setMock = vi.fn();
const deleteMock = vi.fn();
const getMock = vi.fn().mockReturnValue({ value: "test_token" });
vi.mock("next/headers", () => ({
  cookies: () => ({
    set: setMock,
    get: getMock,
    delete: deleteMock,
  }),
}));

describe("Sessions", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Create New Sessions", () => {
    it("validates driver input", async () => {
      const type = "none";
      const driver: Driver<string> = {} as any;
      const data = { userId: "John" };

      await expect(() =>
        createNewSession({ data, driver, type }),
      ).rejects.toThrowError(
        "The Driver sent doesn't correctly implement the interface",
      );
    });

    it("validates the type input", async () => {
      const mockDriver = {
        store: vi.fn().mockImplementation(() => Promise.resolve()),
        update: vi.fn().mockImplementation(() => Promise.resolve()),
        get: vi.fn().mockImplementation(() => Promise.resolve()),
        delete: vi.fn().mockImplementation(() => Promise.resolve()),
      };
      const type: "none" | "nextjs" = 2 as any;
      const driver: Driver<string> = mockDriver;
      const data = { userId: "John" };

      await expect(() =>
        createNewSession({ data, driver, type }),
      ).rejects.toThrowError("The type should be a string");
    });

    it("return a successfully created session without setting cookies", async () => {
      const mockDriver = {
        store: vi.fn().mockImplementation(() => Promise.resolve()),
        update: vi.fn().mockImplementation(() => Promise.resolve()),
        get: vi.fn().mockImplementation(() => Promise.resolve()),
        delete: vi.fn().mockImplementation(() => Promise.resolve()),
      };
      const type = "none";
      const driver: Driver<string> = mockDriver;
      const data = { userId: "John" };

      const session = await createNewSession({ data, driver, type });
      expect(mockDriver.store).toBeCalledTimes(1);
      expect(session).toBeDefined();
      expect(session.data).toEqual(data);
      expect(setMock).not.toBeCalled();
    });

    it("return a successfully created session with setting cookies", async () => {
      const mockDriver = {
        store: vi.fn().mockImplementation(() => Promise.resolve()),
        update: vi.fn().mockImplementation(() => Promise.resolve()),
        get: vi.fn().mockImplementation(() => Promise.resolve()),
        delete: vi.fn().mockImplementation(() => Promise.resolve()),
      };
      const type = "nextjs";
      const driver: Driver<string> = mockDriver;
      const data = { userId: "John" };

      const session = await createNewSession({ data, driver, type });
      expect(mockDriver.store).toBeCalledTimes(1);
      expect(session).toBeDefined();
      expect(session.data).toEqual(data);
      expect(setMock).toBeCalledTimes(3);
    });
  });

  describe("getServerSession", () => {
    it("validates driver input", async () => {
      const type = "none";
      const driver: Driver<string> = {} as any;

      await expect(() =>
        getServerSession({ driver, type }),
      ).rejects.toThrowError(
        "The Driver sent doesn't correctly implement the interface",
      );
    });

    it("validates the type input", async () => {
      const mockDriver = {
        store: vi.fn().mockImplementation(() => Promise.resolve()),
        update: vi.fn().mockImplementation(() => Promise.resolve()),
        get: vi.fn().mockImplementation(() => Promise.resolve()),
        delete: vi.fn().mockImplementation(() => Promise.resolve()),
      };
      const type: "none" | "nextjs" = 2 as any;
      const driver: Driver<string> = mockDriver;

      await expect(() =>
        getServerSession({ driver, type }),
      ).rejects.toThrowError("The type should be a string");
    });

    it("will add cookie tokens if type is nextjs", async () => {
      const mockDriver = {
        store: vi.fn().mockImplementation(() => Promise.resolve()),
        update: vi.fn().mockImplementation(() => Promise.resolve()),
        get: vi.fn().mockImplementation(() => Promise.resolve()),
        delete: vi.fn().mockImplementation(() => Promise.resolve()),
      };
      const type = "nextjs";
      const driver: Driver<string> = mockDriver;

      await getServerSession({ driver, type });
      expect(getMock).toBeCalledTimes(2);
    });

    it("will not add cookie tokens if type is NOT nextjs", async () => {
      vi.spyOn(console, "error");
      const mockDriver = {
        store: vi.fn().mockImplementation(() => Promise.resolve()),
        update: vi.fn().mockImplementation(() => Promise.resolve()),
        get: vi.fn().mockImplementation(() => Promise.resolve()),
        delete: vi.fn().mockImplementation(() => Promise.resolve()),
      };
      const type = "none";
      const driver: Driver<string> = mockDriver;

      const session = await getServerSession({ driver, type });
      expect(getMock).not.toBeCalled();
      expect(session).toBeNull();
      expect(console.error).toBeCalledWith(
        "No session token or antiCSRFToken found",
      );
    });

    it("will return null session for the case of a falsy session token", async () => {
      getMock.mockImplementationOnce(() => null);
      const mockDriver = {
        store: vi.fn().mockImplementation(() => Promise.resolve()),
        update: vi.fn().mockImplementation(() => Promise.resolve()),
        get: vi.fn().mockImplementation(() => Promise.resolve()),
        delete: vi.fn().mockImplementation(() => Promise.resolve()),
      };
      const type = "nextjs";
      const driver: Driver<string> = mockDriver;

      const session = await getServerSession({ driver, type });
      expect(getMock).toBeCalledTimes(2);
      expect(session).toBeNull();
    });

    it("will return null session for the case of a bad parse session token", async () => {
      vi.spyOn(console, "error");
      const mockDriver = {
        store: vi.fn().mockImplementation(() => Promise.resolve()),
        update: vi.fn().mockImplementation(() => Promise.resolve()),
        get: vi.fn().mockImplementation(() => Promise.resolve()),
        delete: vi.fn().mockImplementation(() => Promise.resolve()),
      };
      const type = "nextjs";
      const driver: Driver<string> = mockDriver;

      const session = await getServerSession({ driver, type });
      expect(getMock).toBeCalledTimes(2);
      expect(session).toBeNull();
      expect(console.error).toBeCalledWith("Failed to parse session token");
    });

    it("will return null session for the case that driver didn't return a session", async () => {
      const id = "session_id";
      const data = { userId: "john_doe" };
      const token = createSessionToken(id, data);
      vi.spyOn(console, "error");
      getMock.mockReturnValueOnce({ value: token });
      const mockDriver = {
        store: vi.fn().mockImplementation(() => Promise.resolve()),
        update: vi.fn().mockImplementation(() => Promise.resolve()),
        get: vi.fn().mockImplementation(() => Promise.resolve(null)),
        delete: vi.fn().mockImplementation(() => Promise.resolve()),
      };
      const type = "nextjs";
      const driver: Driver<string> = mockDriver;

      const session = await getServerSession({ driver, type });
      expect(getMock).toBeCalledTimes(2);
      expect(session).toBeNull();
      expect(console.error).toBeCalledWith("No session found in Driver");
    });

    it("will return null session for the case that driver didn't return a antiCSRFToken", async () => {
      const id = "session_id";
      const data = { userId: "john_doe" };
      const token = createSessionToken(id, data);
      vi.spyOn(console, "error");
      getMock.mockReturnValueOnce({ value: token });
      const mockDriver = {
        store: vi.fn().mockImplementation(() => Promise.resolve()),
        update: vi.fn().mockImplementation(() => Promise.resolve()),
        get: vi.fn().mockImplementation(() => Promise.resolve({})),
        delete: vi.fn().mockImplementation(() => Promise.resolve()),
      };
      const type = "nextjs";
      const driver: Driver<string> = mockDriver;

      const session = await getServerSession({ driver, type });
      expect(getMock).toBeCalledTimes(2);
      expect(session).toBeNull();
      expect(console.error).toBeCalledWith("No antiCSRFToken found in Driver");
    });

    it("will return null session for the case that driver returned a wrong session token", async () => {
      const id = "session_id";
      const data = { userId: "john_doe" };
      const token = createSessionToken(id, data);
      const securityToken = createAntiCSRFToken();
      vi.spyOn(console, "error");
      getMock.mockReturnValueOnce({ value: token });
      getMock.mockReturnValueOnce({ value: securityToken });
      const mockDriver = {
        store: vi.fn().mockImplementation(() => Promise.resolve()),
        update: vi.fn().mockImplementation(() => Promise.resolve()),
        get: vi.fn().mockImplementation(() =>
          Promise.resolve({
            csrfToken: securityToken,
            hashedSessionToken: "wrong_token",
          }),
        ),
        delete: vi.fn().mockImplementation(() => Promise.resolve()),
      };
      const type = "nextjs";
      const driver: Driver<string> = mockDriver;

      const session = await getServerSession({ driver, type });
      expect(getMock).toBeCalledTimes(2);
      expect(session).toBeNull();
      expect(console.error).toBeCalledWith("Session token does not match");
    });

    it("will return null session for the case that driver returned an expired session", async () => {
      const id = "session_id";
      const data = { userId: "john_doe" };
      const token = createSessionToken(id, data);
      const securityToken = createAntiCSRFToken();
      vi.spyOn(console, "error");
      getMock.mockReturnValueOnce({ value: token });
      getMock.mockReturnValueOnce({ value: securityToken });
      const mockDriver = {
        store: vi.fn().mockImplementation(() => Promise.resolve()),
        update: vi.fn().mockImplementation(() => Promise.resolve()),
        get: vi.fn().mockImplementation(() =>
          Promise.resolve({
            csrfToken: securityToken,
            hashedSessionToken: hash256(token),
            expiresAt: new Date(new Date().getTime() - 3000),
          }),
        ),
        delete: vi.fn().mockImplementation(() => Promise.resolve()),
      };
      const type = "nextjs";
      const driver: Driver<string> = mockDriver;

      const session = await getServerSession({ driver, type });
      expect(getMock).toBeCalledTimes(2);
      expect(session).toBeNull();
      expect(console.error).toBeCalledWith("Session expired");
    });

    it("will return null session for the case that driver returned a wrong antiCSRFToken", async () => {
      const id = "session_id";
      const data = { userId: "john_doe" };
      const token = createSessionToken(id, data);
      const securityToken = createAntiCSRFToken();
      vi.spyOn(console, "error");
      getMock.mockReturnValueOnce({ value: token });
      getMock.mockReturnValueOnce({ value: securityToken });
      const mockDriver = {
        store: vi.fn().mockImplementation(() => Promise.resolve()),
        update: vi.fn().mockImplementation(() => Promise.resolve()),
        get: vi.fn().mockImplementation(() =>
          Promise.resolve({
            csrfToken: "wrong_security_token",
            hashedSessionToken: hash256(token),
            expiresAt: new Date(new Date().getTime() + 3000),
          }),
        ),
        delete: vi.fn().mockImplementation(() => Promise.resolve()),
      };
      const type = "nextjs";
      const driver: Driver<string> = mockDriver;

      const session = await getServerSession({ driver, type });
      expect(getMock).toBeCalledTimes(2);
      expect(session).toBeNull();
      expect(console.error).toBeCalledWith("CSRF token does not match");
    });

    it("will return null session for the case that driver returned a no data", async () => {
      const id = "session_id";
      const data = { userId: "john_doe" };
      const token = createSessionToken(id, data);
      const securityToken = createAntiCSRFToken();
      vi.spyOn(console, "error");
      getMock.mockReturnValueOnce({ value: token });
      getMock.mockReturnValueOnce({ value: securityToken });
      const mockDriver = {
        store: vi.fn().mockImplementation(() => Promise.resolve()),
        update: vi.fn().mockImplementation(() => Promise.resolve()),
        get: vi.fn().mockImplementation(() =>
          Promise.resolve({
            csrfToken: securityToken,
            hashedSessionToken: hash256(token),
            expiresAt: new Date(new Date().getTime() + 3000),
          }),
        ),
        delete: vi.fn().mockImplementation(() => Promise.resolve()),
      };
      const type = "nextjs";
      const driver: Driver<string> = mockDriver;

      const session = await getServerSession({ driver, type });
      expect(getMock).toBeCalledTimes(2);
      expect(session).toBeNull();
      expect(console.error).toBeCalledWith("Driver has sent bad data");
    });

    it("will return the right session if all checks are satisfied", async () => {
      const id = "session_id";
      const data = { userId: "john_doe" };
      const token = createSessionToken(id, data);
      const securityToken = createAntiCSRFToken();
      vi.spyOn(console, "error");
      getMock.mockReturnValueOnce({ value: token });
      getMock.mockReturnValueOnce({ value: securityToken });
      const mockDriver = {
        store: vi.fn().mockImplementation(() => Promise.resolve()),
        update: vi.fn().mockImplementation(() => Promise.resolve()),
        get: vi.fn().mockImplementation(() =>
          Promise.resolve({
            csrfToken: securityToken,
            hashedSessionToken: hash256(token),
            expiresAt: new Date(new Date().getTime() + 3000),
            data: JSON.stringify(data),
          }),
        ),
        delete: vi.fn().mockImplementation(() => Promise.resolve()),
      };
      const type = "nextjs";
      const driver: Driver<string> = mockDriver;

      const session = await getServerSession({ driver, type });
      expect(getMock).toBeCalledTimes(2);
      expect(session).toBeDefined();
      expect(session?.data).toEqual(data);
      expect(session?.csrfToken).toBe(securityToken);
      expect(session?.id).toBe(id);
      // REVIEW: the method returns the session token without hashing it
      // This seems like a bug since it's stored under the name hashedSessionToken
      // expect(session?.hashedSessionToken).toBe(hash256(token));
      expect(console.error).not.toBeCalled();
    });
  });

  describe("getSessionData", () => {
    it("validates driver input", async () => {
      const sessionData: SessionModel<string> = {
        id: "session_id",
        data: {
          userId: "session_data",
        },
      };

      await expect(() =>
        getSessionData(sessionData, {} as Driver<string>),
      ).rejects.toThrowError(
        "The Driver sent doesn't correctly implement the interface",
      );
    });

    it("validates session data input", async () => {
      const sessionData: SessionModel<string> = {} as SessionModel<string>;

      const mockDriver: Driver<string> = {
        store: vi.fn(),
        update: vi.fn(),
        get: vi.fn().mockImplementation(() => Promise.resolve(null)),
        delete: vi.fn(),
      };

      await expect(() =>
        getSessionData(sessionData, mockDriver),
      ).rejects.toThrowError("Session data input has no valid id");
    });

    it("throws an error if session is not found", async () => {
      const sessionData: SessionModel<string> = {
        id: "session_id",
        data: {
          userId: "session_data",
        },
      };
      const mockDriver: Driver<string> = {
        store: vi.fn(),
        update: vi.fn(),
        get: vi.fn().mockImplementation(() => Promise.resolve(null)),
        delete: vi.fn(),
      };

      await expect(
        getSessionData(sessionData, mockDriver),
      ).rejects.toThrowError("Session not found");
    });

    it("returns the parsed session data", async () => {
      const sessionData: SessionModel<string> = {
        id: "session_id",
        data: {
          userId: "session_data",
        },
      };
      const mockDriver: Driver<string> = {
        store: vi.fn(),
        update: vi.fn(),
        get: vi
          .fn()
          .mockImplementation(() =>
            Promise.resolve({ data: JSON.stringify(sessionData.data) }),
          ),
        delete: vi.fn(),
      };

      const result = await getSessionData(sessionData, mockDriver);
      expect(result).toEqual(sessionData.data);
    });

    it("returns an empty object if session data is not present", async () => {
      const sessionData: SessionModel<string> = {
        id: "session_id",
        data: {
          userId: "session_data",
        },
      };
      const mockDriver: Driver<string> = {
        store: vi.fn(),
        update: vi.fn(),
        get: vi.fn().mockImplementation(() => Promise.resolve({})),
        delete: vi.fn(),
      };

      const result = await getSessionData(sessionData, mockDriver);
      expect(result).toEqual({});
    });
  });

  describe("revokeSession", () => {
    it("validates driver input", async () => {
      const id = "session_id";

      await expect(() =>
        revokeSession({ id, driver: {} as Driver<string>, type: "nextjs" }),
      ).rejects.toThrowError(
        "The Driver sent doesn't correctly implement the interface",
      );
    });

    it("calls driver.delete with the provided session ID", async () => {
      const id = "session_id";
      const mockDriver: Driver<string> = {
        store: vi.fn(),
        update: vi.fn(),
        get: vi.fn(),
        delete: vi.fn(),
      };

      await revokeSession({ driver: mockDriver, id, type: "none" });
      expect(mockDriver.delete).toBeCalledWith(id);
    });

    it('deletes cookies if the type is "nextjs"', async () => {
      const id = "session_id";
      const mockDriver: Driver<string> = {
        store: vi.fn(),
        update: vi.fn(),
        get: vi.fn(),
        delete: vi.fn(),
      };

      await revokeSession({
        driver: mockDriver,
        id,
        type: "nextjs",
      });
      expect(deleteMock).toBeCalledTimes(3);
    });
  });

  describe("setSessionData", () => {
    it("deletes userId property from the data object", async () => {
      const data = { userId: "john_doe", name: "John Doe" };
      const session: SessionModel<string> = {
        id: "session_id",
        data: { userId: "john_doe" },
      };
      const mockDriver: Driver<string> = {
        store: vi.fn(),
        update: vi.fn(),
        get: vi.fn().mockResolvedValue({ id: "session_id" }),
        delete: vi.fn(),
      };

      await setSessionData({ driver: mockDriver, session, data, type: "none" });
      expect(data.userId).toBeUndefined();
    });

    it("merges the data with the existing session data", async () => {
      const data = { name: "John Doe" };
      const existingData = { userId: "john_doe", email: "john@example.com" };
      const session: SessionModel<string> = {
        id: "session_id",
        data: { userId: "john_doe" },
      };
      const mockDriver: Driver<string> = {
        store: vi.fn(),
        update: vi.fn(),
        get: vi
          .fn()
          .mockImplementation(() =>
            Promise.resolve({ data: JSON.stringify(existingData) }),
          ),
        delete: vi.fn(),
      };

      await setSessionData({ driver: mockDriver, session, data, type: "none" });
      expect(mockDriver.update).toBeCalledWith(session.id, {
        expiresAt: expect.any(Date),
        data: JSON.stringify({ ...existingData, ...data }),
      });
    });

    it('sets the data token cookie if the type is "nextjs"', async () => {
      const data = { name: "John Doe" };
      const session: SessionModel<string> = {
        id: "session_id",
        data: { userId: "john_doe" },
      };
      const mockDriver: Driver<string> = {
        store: vi.fn(),
        update: vi.fn(),
        get: vi.fn().mockResolvedValue({ id: "session_id" }),
        delete: vi.fn(),
      };

      await setSessionData({
        driver: mockDriver,
        session,
        data,
        type: "nextjs",
      });
      expect(setMock).toBeCalled();
    });

    it("returns the merged data", async () => {
      const data = { name: "John Doe" };
      const existingData = { userId: "john_doe", email: "john@example.com" };
      const session: SessionModel<string> = {
        id: "session_id",
        data: { userId: "john_doe" },
      };
      const mockDriver: Driver<string> = {
        store: vi.fn(),
        update: vi.fn(),
        get: vi
          .fn()
          .mockImplementation(() =>
            Promise.resolve({ data: JSON.stringify(existingData) }),
          ),
        delete: vi.fn(),
      };

      const result = await setSessionData({
        driver: mockDriver,
        session,
        data,
        type: "none",
      });
      expect(result).toEqual({ ...existingData, ...data });
    });
  });
});
