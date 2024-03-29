"use client";

import {
  Badge,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Button,
  buttonVariants,
  TagInputField,
} from "@dir/ui";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Megaphone,
} from "lucide-react";
import { Category, Post, Comment, Broadcast } from "@dir/db/drizzle/types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getAllPosts } from "../actions";
import { applyEffects } from "~/itemEffects";
import { UserWithInventory } from "~/lib/types";
import { cn } from "@/utils";

interface ExtendedComment extends Comment {
  user: UserWithInventory;
}

export interface ExtendedPost extends Post {
  comments: ExtendedComment[];
  replyCount: number;
  lastCommentOrReply?: ExtendedComment;
  user: UserWithInventory;
  category: {
    title: string;
    slug: string;
  };
  broadcasts?: Broadcast[];
}

export const PostList = ({ categories }: { categories: Category[] }) => {
  const [selectedCategory, setSelectedCategory] = React.useState("all");

  const ITEMS_PER_PAGE = 10;
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const page = Number(searchParams.get("page")) || 0;
  const searchQuery = searchParams.get("search");
  const searchTags = searchParams.get("tags");
  const tablePage = Number(page);
  const skip = tablePage * ITEMS_PER_PAGE;
  const router = useRouter();
  const startPage = tablePage * ITEMS_PER_PAGE + 1;
  let endPage = startPage - 1 + ITEMS_PER_PAGE;

  const [data, setData] = useState<ExtendedPost[]>([]);
  const [count, setCount] = useState(0);
  const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const [tags, setTags] = useState<string[]>([]);

  if (endPage > count) {
    endPage = count;
  }


  if (searchTags) {
    setTags([searchTags]);
  }


  // TODO: Use react-query. duh.
  const getPostsData = async () => {
    const result = await getAllPosts({
      skip: skip,
      take: ITEMS_PER_PAGE,
      tags: tags,
      categorySlug: selectedCategory,
    });
    setData(result.posts);
    setCount(result.count);
  }

  useEffect(() => {
    getPostsData()
  }, [pathname, page, searchQuery, router, selectedCategory, tags]);

  return (
    <div className="flex flex-col gap-12">
      <div className="flex justify-between items-center gap-2 md:gap-8">
        <div className="w-full h-[40px] md:h-auto md:w-4/12">
          <Select
            value={selectedCategory}
            onValueChange={(e) => {
              setSelectedCategory(e);
              router.push("?page=0");
            }}
          >
            <SelectTrigger className="bg-primary-900 w-full rounded">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-primary-900 rounded">
              <SelectItem
                key={"All Posts"}
                value={"all"}
                className={`hover:bg-primary-700 rounded`}
              >
                All Posts
              </SelectItem>
              {categories.map((option) => (
                <SelectItem
                  key={option.title}
                  value={option.slug}
                  className={`hover:bg-primary-700 rounded`}
                >
                  {option.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full h-[40px] md:h-auto md:w-4/12">
          <TagInputField
            value={tags}
            onChange={(newTagString) => {
              setTags(newTagString);
            }}
          />
        </div>
        <div className="w-full h-[40px] md:h-auto md:w-4/12 flex gap-0 md:gap-4 justify-end">
          <Link
            href={`/posts/new`}
            className={`${buttonVariants({
              variant: "default",
            })} flex items-center gap-2 w-full md:w-auto`}
          >
            <PlusCircle className="h-4 w-4" />
            Post
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {data.map((post) => {
          return (
            <div
              key={post.id}
              className={cn(
                `pt-4 bg-transparent relative border-b rounded pb-4 flex items-center gap-4 w-full justify-between px-4 md:px-8`,
                post.broadcasts &&
                  post.broadcasts.length &&
                  "bg-primary-700 py-8",
              )}
            >
              {post.broadcasts && post.broadcasts.length ? (
                <Megaphone className="transform -rotate-12 w-4 h-4 absolute top-2 left-2" />
              ) : null}
              <div className="flex gap-4 mr-4 md:flex-[4_4_0%] flex-[3_3_0%] lg:flex-[2_2_0%] min-w-0">
                {applyEffects(
                  "avatar",
                  {
                    avatar: post.user.avatar || "",
                    username: post.user.username,
                  },
                  post.user.inventory,
                )}
                <div className="flex flex-col">
                  <Link href={`/posts/${post.slug}`}>
                    <span className="text-link font-semibold">
                      {post.title}
                    </span>
                  </Link>
                  <span className="text-xs flex items-center gap-2">
                    <Link href={`/profile/${post.user.username}`}>
                      {applyEffects(
                        "username",
                        { username: post.user.username },
                        post.user.inventory,
                      )}
                    </Link>{" "}
                    •{" "}
                    <span className="text-xs">
                      {post.createdAt.toDateString()}
                    </span>
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0 hidden md:flex items-center justify-center">
                <Badge>{post.category?.title}</Badge>
              </div>
              <div className="flex-1 min-w-0 flex items-center justify-center">
                <Link
                  href={`/posts/${post.slug}`}
                  className="text-link text-sm font-medium flex items-center space-x-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <div>{post.replyCount} <span className="hidden">replies</span></div>
                </Link>
              </div>
              <div className="hidden lg:flex flex-1 min-w-0 justify-end">
                <div className="flex flex-col items-end">
                  <span className="text-primary-100 text-xs self-end">
                    Last reply
                  </span>
                  {post.lastCommentOrReply ? (
                    <div className="flex gap-4 justify-end">
                      {applyEffects(
                        "avatar",
                        {
                          avatar: post.lastCommentOrReply.user.avatar || "",
                          username: post.lastCommentOrReply.user.username,
                        },
                        post.lastCommentOrReply.user.inventory,
                      )}
                      <div className="flex flex-col items-end">
                        <Link
                          href={`/profile/${post.lastCommentOrReply.user.username}`}
                        >
                          <span className="text-link text-sm">
                            {applyEffects(
                              "username",
                              {
                                username:
                                  post.lastCommentOrReply.user.username || "",
                              },
                              post.lastCommentOrReply.user.inventory,
                            )}
                          </span>
                        </Link>
                        <span className="text-xs self-end">
                          {post.lastCommentOrReply.createdAt.toDateString()}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span className="text-xs">No comments</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 w-full justify-center">
        <Button
          disabled={!(tablePage !== 0)}
          onClick={() => router.push(`?page=${page - 1}`)}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="flex">
          {pageNumbers.map((pageNumber, index) => (
            <button
              className={`py-2 px-4 bg-primary text-primary-foreground border-y shadow-emerald-900/40 shadow-inner saturate-150 hover:saturate-100 inline-flex items-center justify-center text-xs font-medium disabled:pointer-events-none disabled:opacity-50 
            ${index === 0 ? "rounded-l border border-border-subtle" : ""} 
            ${
              index !== 0 && index !== pageNumbers.length - 1
                ? "border-r border-border-subtle"
                : ""
            } 
            ${
              index === pageNumbers.length - 1
                ? "rounded-r border-r border-border-subtle"
                : ""
            }`}
              key={pageNumber}
              disabled={pageNumber === page + 1}
              onClick={() => router.push(`?page=${pageNumber - 1}`)}
            >
              {pageNumber}
            </button>
          ))}
        </div>

        <Button
          disabled={!(skip + ITEMS_PER_PAGE < count)}
          onClick={() => router.push(`?page=${page + 1}`)}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
