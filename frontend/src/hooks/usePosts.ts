'use client';

import { useEffect, useState } from 'react';
import type { WPPost } from '@/types/wordpress';

export function usePosts() {
  const [posts, setPosts] = useState<WPPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch('/api/wp/posts?_embed')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: WPPost[]) => setPosts(data))
      .catch((e: Error) => setError(e))
      .finally(() => setLoading(false));
  }, []);

  return { posts, loading, error };
}
