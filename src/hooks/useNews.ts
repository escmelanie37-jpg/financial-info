import { useState, useEffect, useCallback } from "react";

export interface NewsArticle {
  title: string;
  description: string | null;
  url: string;
  source: string;
  publishedAt: string;
  thumbnail: string | null;
  category?: string;
}

interface UseNewsReturn {
  articles: NewsArticle[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useNews(category?: string): UseNewsReturn {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      params.set("limit", "20");
      const res = await fetch(`/api/news?${params}`);
      if (!res.ok) throw new Error("Error al cargar noticias");
      const result = await res.json();
      setArticles(result.data ?? result.articles ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { articles, loading, error, refresh };
}
