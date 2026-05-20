// WordPress REST API type stubs — expand as needed

export interface WPRendered {
  rendered: string;
}

export interface WPPost {
  id: number;
  date: string;
  slug: string;
  status: string;
  title: WPRendered;
  content: WPRendered;
  excerpt: WPRendered;
  link: string;
  featured_media: number;
  categories: number[];
  tags: number[];
  _embedded?: {
    'wp:featuredmedia'?: WPMedia[];
    'wp:term'?: WPTerm[][];
    author?: WPAuthor[];
  };
}

export interface WPPage {
  id: number;
  date: string;
  slug: string;
  status: string;
  title: WPRendered;
  content: WPRendered;
  link: string;
  parent: number;
}

export interface WPMedia {
  id: number;
  source_url: string;
  alt_text: string;
  media_details: {
    width: number;
    height: number;
    sizes: Record<string, { source_url: string; width: number; height: number }>;
  };
}

export interface WPTerm {
  id: number;
  name: string;
  slug: string;
  taxonomy: string;
  link: string;
}

export interface WPAuthor {
  id: number;
  name: string;
  slug: string;
  avatar_urls: Record<string, string>;
}
