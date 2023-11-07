"use server";
import {
  COOKIE_CSRF_TOKEN,
  COOKIE_PUBLIC_DATA_TOKEN,
  COOKIE_SESSION_TOKEN,
} from "./constants";
import type { SessionModel, Driver } from "./types";
import {
  checkDriverInterface,
  createAntiCSRFToken,
  createSessionToken,
  generateSessionId,
  hash256,
  parseSessionToken,
} from "./utils";
import type { Data } from "./types";
import { toBase64 } from "b64-lite";
import { cookies } from "next/headers";

export const getServerSession = async <T>({
  driver,
  type,
}: {
  driver: Driver<T>;
  type: "nextjs" | "none";
}) => {
  if (!checkDriverInterface(driver)) {
    throw new Error(
      "The Driver sent doesn't correctly implement the interface",
    );
  }

  if (typeof type !== "string") {
    throw new Error("The type should be a string");
  }

  let sessionToken;
  let antiCSRFToken;

  if (type === "nextjs") {
    sessionToken = cookies().get(COOKIE_SESSION_TOKEN)?.value;
    antiCSRFToken = cookies().get(COOKIE_CSRF_TOKEN)?.value;
  }

  if (!sessionToken || !antiCSRFToken) {
    console.error("No session token or antiCSRFToken found");
    return null;
  }

  if (sessionToken) {
    let id: string;
    try {
      const session = parseSessionToken(sessionToken);
      if (!session.id) {
        console.error("No id in session token");
        return null;
      }
      id = session.id;
    } catch (e) {
      const error = e as Error;
      console.error(error.message);
      return null;
    }

    const driverSession = await driver.get(id);
    if (!driverSession) {
      console.error("No session found in Driver");
      return null;
    }

    if (!driverSession.csrfToken) {
      console.error("No antiCSRFToken found in Driver");
      return null;
    }

    if (driverSession.hashedSessionToken !== hash256(sessionToken)) {
      console.error("Session token does not match");
      return null;
    }

    if (
      driverSession.expiresAt &&
      driverSession.expiresAt.getTime() < Date.now()
    ) {
      console.error("Session expired");
      return null;
    }

    if (driverSession.csrfToken !== antiCSRFToken) {
      console.error("CSRF token does not match");
      return null;
    }

    try {
      const data = JSON.parse(driverSession.data) as Data<T>;

      return {
        id,
        data,
        csrfToken: driverSession.csrfToken,
        hashedSessionToken: sessionToken,
      };
    } catch (e) {
      console.error("Driver has sent bad data");
      return null;
    }
  }

  return null;
};

export type CreateNewSessionParams<T> = Awaited<
  ReturnType<typeof getServerSession<T>>
>;

export const createNewSession = async <T>({
  data,
  driver,
  type,
}: {
  data: Data<T>;
  driver: Driver<T>;
  type: "nextjs" | "none";
}) => {
  if (!checkDriverInterface(driver)) {
    throw new Error(
      "The Driver sent doesn't correctly implement the interface",
    );
  }

  if (typeof type !== "string") {
    throw new Error("The type should be a string");
  }
  const csrfToken = createAntiCSRFToken();
  const sessionId = generateSessionId();

  const expiresAt = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7);
  const sessionToken = createSessionToken(sessionId, data);
  const dataToken = toBase64(JSON.stringify(data));

  await driver.store({
    expiresAt,
    id: sessionId,
    hashedSessionToken: hash256(sessionToken),
    csrfToken,
    data,
  });

  if (type === "nextjs") {
    cookies().set(COOKIE_SESSION_TOKEN, sessionToken, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: expiresAt,
      sameSite: "lax",
      domain: /localhost:/.test(process.env.NEXT_PUBLIC_APP_URL as string)
        ? "localhost"
        : process.env.NEXT_PUBLIC_APP_URL?.replace("https://", ""),
    });

    cookies().set(COOKIE_CSRF_TOKEN, csrfToken, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: expiresAt,
      sameSite: "lax",
      domain: /localhost:/.test(process.env.NEXT_PUBLIC_APP_URL as string)
        ? "localhost"
        : process.env.NEXT_PUBLIC_APP_URL?.replace("https://", ""),
    });

    cookies().set(COOKIE_PUBLIC_DATA_TOKEN, dataToken, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: expiresAt,
      sameSite: "lax",
      domain: /localhost:/.test(process.env.NEXT_PUBLIC_APP_URL as string)
        ? "localhost"
        : process.env.NEXT_PUBLIC_APP_URL?.replace("https://", ""),
    });
  }

  return {
    id: generateSessionId(),
    data,
    csrfToken,
    hashedSessionToken: sessionToken,
  };
};

export const revokeSession = async <T>({
  driver,
  id,
  type,
}: {
  driver: Driver<T>;
  id: string;
  type: "nextjs" | "none";
}) => {
  if (!checkDriverInterface(driver)) {
    throw new Error(
      "The Driver sent doesn't correctly implement the interface",
    );
  }
  await driver.delete(id);
  if (type === "nextjs") {
    cookies().delete(COOKIE_SESSION_TOKEN);
    cookies().delete(COOKIE_CSRF_TOKEN);
    cookies().delete(COOKIE_PUBLIC_DATA_TOKEN);
  }
};

export async function getSessionData<T>(
  sessionData: SessionModel<T>,
  driver: Driver<T>,
): Promise<Data<T>> {
  if (!checkDriverInterface(driver)) {
    throw new Error(
      "The Driver sent doesn't correctly implement the interface",
    );
  }

  if (!sessionData || !sessionData.id) {
    throw new Error("Session data input has no valid id");
  }
  const session = await driver.get(sessionData.id);

  if (!session) {
    throw new Error("Session not found");
  }
  if (session.data) {
    return JSON.parse(session.data) as Data<T>;
  } else {
    return {} as Data<T>;
  }
}

export const setSessionData = async <T>({
  data,
  session,
  driver,
  type,
}: {
  driver: Driver<T>;
  session: SessionModel<T>;
  data: Record<any, any>;
  type: "nextjs" | "none";
}) => {
  delete data.userId;

  const _data = {
    ...(await getSessionData<T>(session, driver)),
    ...data,
  } as Data<T>;

  const expiresAt = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7);
  const dataToken = toBase64(JSON.stringify(_data));

  if (type === "nextjs") {
    cookies().set(COOKIE_PUBLIC_DATA_TOKEN, dataToken, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: expiresAt,
      sameSite: "lax",
      domain: /localhost:/.test(process.env.NEXT_PUBLIC_APP_URL as string)
        ? "localhost"
        : process.env.NEXT_PUBLIC_APP_URL?.replace("https://", ""),
    });
  }

  await driver.update(session.id, {
    expiresAt,
    data: JSON.stringify(_data),
  });

  return _data;
};

export type SetSessionData<T> = Awaited<ReturnType<typeof setSessionData<T>>>;
