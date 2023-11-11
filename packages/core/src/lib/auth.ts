import {
  AuthInit, Driver, TCreateGuard
} from "@dir/auth";



export const authInit = <T>({driver, guards, oauth}: {driver: Driver<T>, guards: TCreateGuard<T>, oauth?: {
  providers: {
      github: {
          clientId: string;
          clientSecret: string;
      };
      google: {
          clientId: string;
          clientSecret: string;
      };
  };
  baseUrl: string;
}}) => {
  const auth = new AuthInit<T>({ 
    driver,
    guards,
    oauth
  })

  return auth
}

