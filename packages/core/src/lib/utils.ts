import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function findFreeSlug<T>(
  prefix: string,
  fetchResults: (slug: string) => Promise<T | null>,
  maxAttempts = 10,
) {
  for (let i = 1; i < maxAttempts; i++) {
    const slug = i > 1 ? `${prefix}-${i}` : prefix;
    const result = await fetchResults(slug);

    if (!result) {
      return slug;
    }
  }
  throw new Error(
    `Could not find a free slug for ${prefix} after ${maxAttempts} attempts`,
  );
}