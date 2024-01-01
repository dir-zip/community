"use server"

import { prisma, type Category, Tag } from "@dir/db";
import { z } from "zod";


import {createAction} from '../../../../lib/createAction';
import { CreateBroadcastSchema } from "../../../../features/broadcasts/schemas";
import { findFreeSlug } from "../../../../lib/utils";
import { prepareArrayField } from "@creatorsneverdie/prepare-array-for-prisma";
import { sendEmail } from "../../../../jobs";


export const createBroadcast = createAction(async({}, {title, body, tags}) => {


  const createSlug = await findFreeSlug<Category>(
    title.toLowerCase().replace(/[^a-z0-9]/g, "-"),
    async (slug: string) =>
      await prisma.broadcast.findUnique({ where: { slug } }),
  );



  const newTags = await Promise.all(
    tags.split(",").map(async (tagSlug) => {
      tagSlug = tagSlug.trim(); // Trim whitespace
  
      if (!tagSlug) return null; // Skip empty strings
  
      // Check if the tag already exists
      const existingTag = await prisma.tag.findUnique({ where: { slug: tagSlug } });
  
      if (existingTag) {
        // If the tag exists, return it to connect to it
        return { id: existingTag.id };
      } else {
        // If the tag doesn't exist, generate a new slug and create a new tag
        const updatedTagSlug = await findFreeSlug<Tag>(
          tagSlug.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          async (slug: string) =>
            await prisma.tag.findUnique({ where: { slug } }),
        );
  
        return { title: tagSlug, slug: updatedTagSlug };
      }
    })
  );

  const filteredTags = newTags.filter(Boolean);

  const broadcast = await prisma.broadcast.create({
    data: {
      title,
      slug: createSlug,
      body,
      tags: prepareArrayField(
        filteredTags.map((c) => {
          return c
        })
      ),
    }
  })

  const users = await prisma.user.findMany({})

  for(const user of users) {
    await sendEmail.queue.add('sendEmail', {email: user.email, subject: broadcast.title, template: `${broadcast.body}`})

    // Update the broadcast
    await prisma.broadcast.update({
      where: {
        id: broadcast.id
      },
      data: {
        sentTo: {
          connect: {
            id: user.id
          }
        }
      }
    })
  }


  return broadcast

}, CreateBroadcastSchema, {authed: true})

export const getSingleBroadcast = createAction(async({}, {slug}) => {
  const broadcast = await prisma.broadcast.findFirst({
    where:{ 
      slug: slug
    },
    include: {
      tags: true
    }
  })

  return broadcast
}, z.object({
  slug: z.string()
}))

export const updateBroadcast = createAction(async({}, {id, data}) => {
  // Fetch the current category
  const currentBroadcast = await prisma.broadcast.findUnique({ where: { id }, include: {tags: true} });

  let slug;
  // If the title has changed, generate a new slug
  if (currentBroadcast?.title !== data.title) {
    slug = await findFreeSlug<Category>(
      data.title.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      async (slug: string) =>
        await prisma.broadcast.findUnique({ where: { slug } }),
    );
  } else {
    // If the title hasn't changed, keep the current slug
    slug = currentBroadcast?.slug;
  }



  const newTags = await Promise.all(
    data.tags.split(",").map(async (tagSlug) => {
      tagSlug = tagSlug.trim(); // Trim whitespace
  
      if (!tagSlug) return null; // Skip empty strings
  
      // Check if the tag already exists
      const existingTag = await prisma.tag.findUnique({ where: { slug: tagSlug } });
  
      if (existingTag) {
        // If the tag exists, return it to connect to it
        return { id: existingTag.id };
      } else {
        // If the tag doesn't exist, generate a new slug and create a new tag
        const updatedTagSlug = await findFreeSlug<Tag>(
          tagSlug.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          async (slug: string) =>
            await prisma.tag.findUnique({ where: { slug } }),
        );
  
        return { title: tagSlug, slug: updatedTagSlug };
      }
    })
  );

  const filteredTags = newTags.filter(Boolean);


  const mappedTags = prepareArrayField(
    filteredTags,
    currentBroadcast?.tags,
    (item) => ({
      ...item,
    }),
    { removedItemsMethod: "disconnect" }
  )



  const broadcast = await prisma.broadcast.update({
    where:{ 
      id
    },
    data: {
      ...data,
      slug,
      tags: mappedTags
    }
  })

  return broadcast
}, z.object({
  id: z.string(),
  data: CreateBroadcastSchema
}))


export const getAllBroadcasts = createAction(
  async({}, params) => {
    if (!params) {
      throw new Error('Parameters are undefined');
    }
    const { skip, take, where } = params;

    const findBroadcasts = await prisma.broadcast.findMany({
      take,
      skip,
      where
    })

    const count = await prisma.broadcast.count({
      where
    })

    return {broadcasts: findBroadcasts, count}
  },
  z.object({
    skip: z.number().optional(),
    take: z.number().optional(),
    where: z.any()
  })
)