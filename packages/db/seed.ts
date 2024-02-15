import { db } from './index'
import * as schema from './drizzle/schema'

const load = async () => {

  await db.insert(schema.action).values([
    {
      title: "CREATE_COMMENT",
      value: 1,
    },
    {
      title: "CREATE_POST",
      value: 1
    }
  ])

  await db.insert(schema.globalSetting).values({
    id: 1
  })

  await db.insert(schema.featureToggle).values([
    {
      isActive: false,
      feature: 'private'
    },
    {
      isActive: true,
      feature: 'broadcastPin',
      value: '0'
    },
    {
      isActive: true,
      feature: 'signupFlow',
      value: 'open'
    }
  ])

  await db.insert(schema.category).values({
    title: "General",
    slug: "general"
  })

  await db.insert(schema.list).values([
    {
      title: "Unsubscribed",
      slug: "unsubscribed"
    },
    {
      title: "General",
      slug: "general"
    }
  ])

}

load()
