import { AuthorizationError } from "./src/errors";
import { type CrudTypes, GuardBuilder, type TCreateGuard } from "./src/guard";
import { getServerSession, createNewSession, revokeSession, setSessionData } from "./src/sessions";
import type { Data, Driver } from "./src/types";
import {type Provider, getEmailFromCallback, githubCallbackUrl, googleCallbackUrl} from "./src/oauth"

export * from "./src/types";
export * from "./src/guard";
export * from "./src/oauth";
export * from "./src/sessions";
export * from "./src/passwords"
export * from "./src/constants"
export * from "./src/utils"

export class AuthInit<T> {
  driver: Driver<T>
  framework: "nextjs" | "none"
  guards?: TCreateGuard<T>
  oauthDetails?: {
    providers: {
      [key in Provider]: {clientId: string, clientSecret: string}
    },
    baseUrl: string
  }

  constructor(
    args: {
      driver: Driver<T>,
      framework?: "nextjs" | "none",
      guards?: TCreateGuard<T>,
      oauth?: {
        providers: {
          [key in Provider]: {clientId: string, clientSecret: string}
        },
        baseUrl: string
      }
    }
  ) {

    this.driver = args.driver
    this.framework = args.framework || "nextjs"

    if(this.framework !== "nextjs") {
      throw new Error("Only nextjs is supported at the moment")
    }

    if(args.oauth) {
      this.oauthDetails = args.oauth
    }


    this.getSession = this.getSession.bind(this)
    this.deleteSession = this.deleteSession.bind(this)
    this.updateSession = this.updateSession.bind(this)
    this.createSession = this.createSession.bind(this)
    this.authorizeFunction = this.authorizeFunction.bind(this)
    this.validate = this.validate.bind(this)
    this.getOAuthEmail = this.getOAuthEmail.bind(this)
    this.getOAuthUrl  = this.getOAuthUrl.bind(this)

    if(args.guards) {
      this.guards = args.guards
    }
  }

  async getSession() {
    const session = await getServerSession<T>({
      driver: this.driver,
      type: this.framework,
    })
    return session
  }

  async createSession(data: Data<T>) {
    const session = await createNewSession<T>({
      data,
      driver: this.driver,
      type: this.framework,
    });
    return session
  }

  async deleteSession() {
    const session = await this.getSession()

    if(!session) {
      throw new Error("No session found")
    }

    await revokeSession({
      driver: this.driver,
      id: session.id,
      type: this.framework,
    });
  }

  async updateSession(data: Partial<Data<T>>) {
    const session = await this.getSession()
    if(!session) {
      throw new Error("No session found")
    }
    const _data = await setSessionData<T>({ driver: this.driver, session, data, type: this.framework});
    return _data
  }

  authorizeFunction(asyncFn: (...args: any[]) => Promise<any>) {
    const self = this

    return async function(...args: any[]) {
      const session = await self.getSession()
      if(!session) {
        throw new Error("No session found")
      }

      if(self.guards) {
        const guard = new GuardBuilder<T>(session.data)
        await guard.createGuards(self.guards)
      }


      try {
        const result = await asyncFn(...args)
        return result
      } catch(error) {
        console.error(error)
      }
    }
  }

  async validate(rule: [CrudTypes, string, ...unknown[]], options: {throw?: boolean} = {throw: true}) {
    const session = await this.getSession()
    if(!session) {
      throw new Error("No session found")
    }

    if(!this.guards) {
      return
    }

    const guard = new GuardBuilder<T>(session.data)
    await guard.createGuards(this.guards)
    
    const can = await guard.validateGuard([rule[0], rule[1]], rule[2]);
    if(options?.throw && !can) {
      throw new AuthorizationError()
    }

    return can

  }
  
  async getOAuthEmail({ code, callback }: {
    code: string;
    callback: string[];
  }) {
    if(!this.oauthDetails) {
      throw new Error("No oauth details provided")
    }
    const {email} = await getEmailFromCallback({code, callback}, this.oauthDetails)
    return email
  }

  async getOAuthUrl(provider: Provider): Promise<string> {
    let url
    if(!this.oauthDetails) {
      throw new Error("No oauth details provided")
    }

    if(!this.oauthDetails.providers[provider]) {
      throw new Error("No provider found")
    }

    switch(provider) {
      case "google":
        url = googleCallbackUrl({clientId: this.oauthDetails.providers[provider].clientId, baseUrl: this.oauthDetails.baseUrl})
        break;
      case "github":
        url = githubCallbackUrl({clientId: this.oauthDetails.providers[provider].clientId, baseUrl: this.oauthDetails.baseUrl})
        break;
    }
    

    return url
  }

}
