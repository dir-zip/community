import { TCreateGuard } from "@dir/auth";
import { prisma } from "@dir/db";
import { BaseSessionData } from ".";

export const createGuards = <T>({guards, internal}: {guards: TCreateGuard<T & BaseSessionData>,internal: TCreateGuard<BaseSessionData>}) => {
  
  let mix = (func1: (...args: any[]) => any, func2: (...args: any[]) => any) => {
    return (...args: any[]) => {
      func1(...args);
      func2(...args);
    }
  }
  
  const _guards = mix(guards, internal)

  return _guards as TCreateGuard<T & BaseSessionData>
}

export const guards: TCreateGuard<BaseSessionData> = async ({sessionData, can, cannot}) => {

  if (sessionData && sessionData.role === "ADMIN") {
    can("SUPER", "all");
  } else {
    cannot("SUPER", "all");
  }

  if (sessionData && sessionData.userId) {

  }


}
