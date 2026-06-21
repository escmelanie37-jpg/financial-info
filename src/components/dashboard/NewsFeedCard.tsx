"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { formatTimeAgo } from "@/lib/utils/formatters";

interface Article {
  title: string;
  description: string | null;
  url: string;
  source: string;
  publishedAt: string;
  thumbnail: string | null;
}

export function NewsFeedCard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/news?limit=5");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setArticles(data.data ?? data.articles ?? []);
      } catch {
        setArticles([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-1/3" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold text-foreground mb-3">
        Últimas Noticias
      </h3>
      <div className="space-y-3">
        {articles.length === 0 && (
          <p className="text-sm text-muted-foreground">Sin noticias disponibles</p>
        )}
        {articles.map((article, i) => (
          <a
            key={i}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-3 group"
          >
            {article.thumbnail && (
              <img
                src={article.thumbnail}
                alt=""
                className="w-12 h-12 rounded object-cover flex-shrink-0"
              />
            )}
            <div className="min-w-0">
              <p className="text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {article.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  {article.source}
                </span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(new Date(article.publishedAt).getTime())}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </Card>
  );
}
