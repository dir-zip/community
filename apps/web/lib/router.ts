import { InitDirZip } from "@dir/core";

export const {
  createAction,
  createApiEndpoint,
  createJob,
  PageInit,
  LayoutInit,
  ApiRouteInit,
  generateMetadata,
  auth,
  global,
} = InitDirZip({
  auth: {
    guards: async ({ sessionData }) => {
      console.log(sessionData);
    },
    oauth: {
      providers: {
        google: {
          clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
        github: {
          clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID!,
          clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        },
      },
      baseUrl: process.env.NEXT_PUBLIC_APP_URL!,
    },
  },
}).build();
