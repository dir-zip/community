// FIXME: Remove this block as needed
// export const userInventoryIncludes = {
//   user: {
//     include: {
//       inventory: {
//         include: {
//           collection: {
//             where: {
//               equipped: true
//             },
//             include: {
//               item: true
//             }
//           }
//         }
//       }
//     }
//   },
// }

export const userInventoryIncludes = {
  user: {
    with: {
      inventory: {
        with: {
          inventoryItems: {
            where: (items: any, { eq }: any) => eq(items.equipped, true),
            with: {
              item: true
            }
          }
        }
      }
    }
  }
} as any