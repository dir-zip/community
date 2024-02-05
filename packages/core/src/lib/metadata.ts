import { Metadata } from "next";

export const metadata = ({
  siteTitle,
  pageTitle,
  description,
  keywords,
  type,
  images,
  authors,
}: {
  siteTitle: string;
  pageTitle?: string;
  description: string;
  keywords: string[];
  type: 'article' | 'website',
  images: { url: string; width: number; height: number }[];
  authors?: { name: string; url: string; image: string }[];
}): Metadata => {
  return {
    title: pageTitle ? `${pageTitle} | ${siteTitle}` : siteTitle,
    description: description,
    keywords: keywords,
    openGraph: {
      title: pageTitle ? `${pageTitle} | ${siteTitle}` : siteTitle,
      description: description,
      url: process.env.NEXT_PUBLIC_APP_URL,
      images: images,
      locale: 'en_US',
      type: type,
      authors: type === 'article' ? authors?.map(author => author.name) : undefined,
    },
    robots: {
      follow: true,
      index: false,
      nocache: true,
      googleBot: {
        index: true,
        follow: false,
        noimageindex: true
      }
    },
    twitter: {
      card: 'summary',
      title: pageTitle ? `${pageTitle} | ${siteTitle}` : siteTitle,
      description: description,
      images: images.map(image => image.url),
    },

  };
};

