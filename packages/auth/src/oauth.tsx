export const AllowedProviders = ["github", "google"] as const;
export type Provider = (typeof AllowedProviders)[number];

const isProvider = (value: string): value is Provider => {
  return AllowedProviders.includes(value as Provider);
};

export const getEmailFromCallback = async ({code, callback}: {code: string, callback: string[]}, oauthCredentials: {
  providers: {
    [key in Provider]: {clientId: string, clientSecret: string}
  },
  baseUrl: string
}) => {

  if (!callback) {
    throw new Error("No callback in query params");
  }

  const availableProviders: {
    [key in Provider]: () => Promise<{ email: string; provider: string }>;
  } = {
    github: async () => {
      const response = await fetch(
        `https://github.com/login/oauth/access_token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            client_id: oauthCredentials.providers.github.clientId,
            client_secret: oauthCredentials.providers.github.clientSecret,
            code,
          }),
        },
      );

      const { access_token } = await response.json();

      const email = await fetch(`https://api.github.com/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      });
      const emails = await email.json();
      const primaryEmail = emails.find(
        (email: Record<string, string>) => email.primary,
      ).email;

      return {
        email: primaryEmail,
        provider: "github",
      };
    },
    google: async () => {
      const response = await fetch(`https://oauth2.googleapis.com/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          code,
          client_id: oauthCredentials.providers.google.clientId,
          client_secret: oauthCredentials.providers.google.clientSecret,
          redirect_uri: `${oauthCredentials.baseUrl}/api/auth/google`,
          grant_type: "authorization_code",
        }),
      });

      const tokenData = await response.json();
      const accessToken = tokenData.access_token;

      const userInfoResponse = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      const userInfo = await userInfoResponse.json();

      const primaryEmail = userInfo.email;

      return {
        email: primaryEmail,
        provider: "google",
      };
    },
  };

  const provider = callback[0];

  if (!provider || !isProvider(provider)) {
    throw new Error("Invalid provider");
  }

  const { email, provider: providerName } = await availableProviders[
    provider
  ]();

  return {
    email,
    provider: providerName,
  };
};

export const githubCallbackUrl = ({clientId, baseUrl}: {clientId: string, baseUrl: string}) => {
  const url = `http://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${baseUrl}/api/auth/github&scope=user`;
  return url
};

export const googleCallbackUrl = ({clientId, baseUrl}: {clientId: string, baseUrl: string}) => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${
    clientId
  }&redirect_uri=${
    baseUrl
  }/api/auth/google&scope=${"profile email"}&response_type=${"code"}`;
  return url
};

