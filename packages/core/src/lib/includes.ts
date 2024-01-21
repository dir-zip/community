export const userInventoryIncludes = {
  user: {
    include: {
      inventory: {
        include: {
          collection: {
            where: {
              equipped: true
            },
            include: {
              item: true
            }
          }
        }
      }
    }
  },
}