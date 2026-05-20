const WP_API_BASE =
  process.env.NEXT_PUBLIC_WP_API_BASE ||
  `${process.env.NEXT_PUBLIC_WP_URL}/wp-json/wp/v2`;

const REVALIDATE = Number(process.env.NEXT_PUBLIC_REVALIDATE_SECONDS ?? 60);

async function wpFetch<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${WP_API_BASE}${endpoint}`, {
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) {
    throw new Error(`WordPress API error ${res.status}: ${endpoint}`);
  }
  return res.json() as Promise<T>;
}

export async function getPosts() {
  // TODO: type with WPPost from types/wordpress.ts
  return wpFetch<unknown[]>('/posts?_embed');
}

export async function getPost(slug: string) {
  const results = await wpFetch<unknown[]>(`/posts?slug=${slug}&_embed`);
  return (results as unknown[])[0] ?? null;
}

export async function getPages() {
  return wpFetch<unknown[]>('/pages?_embed');
}

export async function getPage(slug: string) {
  const results = await wpFetch<unknown[]>(`/pages?slug=${slug}&_embed`);
  return (results as unknown[])[0] ?? null;
}
