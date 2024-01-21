import { Prisma, PrismaClient } from "@prisma/client";

type UserWithInventory = Prisma.UserGetPayload<{
  include: { inventory: { include: { collection: true } } };
}>;

type PostWithUserAndInventory = Prisma.PostGetPayload<{
  include: {
    user: {
      include: {
        inventory: {
          include: {
            collection: true
          }
        }
      }
    }
  }
}>


const prismaClient = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
})

type ExtendedPrismaClient = typeof prismaClient

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: ExtendedPrismaClient | undefined;
}

export const prisma = prismaClient



export * from "@prisma/client";

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}


