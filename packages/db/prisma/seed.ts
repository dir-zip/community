import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()


const load = async () => {
  try {
    await prisma.action.create({
      data: {
        title: "CREATE_COMMENT",
        value: 1, // Set the value as per your requirement
      },
    });
  
    await prisma.action.create({
      data: {
        title: "CREATE_POST",
        value: 1, // Set the value as per your requirement
      },
    });

    await prisma.globalSetting.create({
      data: {
        id: 1
      }
    })

    await prisma.featureToggle.create({
      data: {
        globalSetting: {
          connect: {
            id: 1
          }
        },
        isActive: false,
        feature: 'private'
      }
    })


    await prisma.category.create({
      data: {
        title: 'General',
        slug: 'general'
      }
    })

    await prisma.featureToggle.create({
      data: {
        globalSetting: {
          connect: {
            id: 1
          }
        },
        isActive: true,
        feature: 'broadcastPin',
        value: '0'
      }
    })

    await prisma.featureToggle.create({
      data: {
        globalSetting: {
          connect: {
            id: 1
          }
        },
        isActive: true,
        feature: 'signupFlow',
        value: 'open'
      }
    })

    await prisma.list.create({
      data: {
        title: 'Unsubscribed',
        slug: 'unsubscribed'
      }
    })

    await prisma.list.create({
      data: {
        title: 'General',
        slug: 'general'
      }
    })

    console.log('Added data')
  } catch (e) {
    console.error(e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}


load()