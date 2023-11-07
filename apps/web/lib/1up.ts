import {Init1up} from '@1upsaas/core';
import HomeIcon from '../components/Icons/HomeIcon';


export type ExtendedSessionData = {
}

export const {createAction, createApiEndpoint, createJob, PageInit, LayoutInit, ApiRouteInit, auth, global} = Init1up<ExtendedSessionData>({

  auth: {
    guards: async({sessionData}) => {
      console.log(sessionData)
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
        }
      },
      baseUrl: process.env.NEXT_PUBLIC_APP_URL!,
    }
  },
  sidebar: {
    links: [
      {text: 'Home', url: '/', icon: HomeIcon}
    ]
  }
})
.build()

