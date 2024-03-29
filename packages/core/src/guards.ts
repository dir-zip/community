import { TCreateGuard } from "@dir/auth";
import { db } from "@dir/db";
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
    if(sessionData.role === "ADMIN") {
      can("CREATE", "broadcast");
    }

    // can("UPDATE", "post", async (args) => {
    //   const post = await prisma.post.findFirst({
    //     where: { OR: [{ id: args }, { slug: args }] }
    //   });

    //   return post && post.userId === sessionData.userId ? true : false
    // });

    // can("UPDATE", "comment", async (args) => {
    //   const comment = await prisma.comment.findFirst({
    //     where: { OR: [{ id: args }, { id: args }] }
    //   });

    //   return comment && comment.userId === sessionData.userId ? true : false
    // });

    // can("UPDATE", "user", async (args) => {
    //   const user = await prisma.user.findFirst({
    //     where: { OR: [{ id: args }, { id: args }] }
    //   });

    //   return user && user.id === sessionData.userId ? true : false
    // });
  }


}
