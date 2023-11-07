import {type IncomingMessage, type ServerResponse as HTTPResponse} from "http"

export type Data<T> = T extends Record<string, any> ? T : {userId: string}

export interface SessionModel<T> {
  id: string
  data: Data<T>
  csrfToken?: string | null
  hashedSessionToken?: string | null
  expiresAt?: Date | null
}



export interface Driver<T> {
  store: (session: SessionModel<T>) => Promise<any>,
  update: (id: string, data: any) => Promise<any>,
  get: (id: string) => Promise<any>,
  delete: (id: string) => Promise<any>
}


export type ServerRequest<T> = T extends {cookies: unknown} ? T : IncomingMessage & {cookies: Partial<{ [key: string]: string; }>}
export type ServerResponse = HTTPResponse