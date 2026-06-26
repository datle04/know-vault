'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { api } from '../../../lib/api';
import { ArticleStatusBadge } from '@/components/articles/ArticleStatusBadge';

interface Article {
  id: string;
  title: string;
  url: string;
  savedAt: string;
  status: 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
  wordCount: number;
  readingTimeMin: number;
  author: string | null;
  siteName: string | null;
}

interface ArticlesResponse {
  articles: Article[];
  total: number;
  page: number;
  limit: number;
}

export default function DashboardPage() {
  const t = useTranslations('articles.list');
  const tStatus = useTranslations('articles.status');

  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: '1', limit: '20' });
        if (search) params.set('search', search);

        const res = await api.get<ArticlesResponse>(`/articles?${params}`);
        setArticles(res.data.articles);
        setTotal(res.data.total);
      } catch {
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{t('title')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} articles</p>
        </div>
        <Link
          href="/dashboard/save"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          {t('saveButton')}
        </Link>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </form>

      {/* Content */}
      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : articles.length === 0 ? (
        <p className="text-sm text-gray-500">{t('empty')}</p>
      ) : (
        <div className="space-y-3">
          {articles.map((article) => (
            <div
              key={article.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-medium text-gray-900 truncate">{article.title}</h2>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{article.url}</p>
                </div>
                <span className="text-xs text-gray-500 shrink-0">
                  <ArticleStatusBadge status={article.status} />
                </span>
              </div>

              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                {article.author && <span>{article.author}</span>}
                <span>{t('readingTime', { min: article.readingTimeMin })}</span>
                <span>{t('wordCount', { count: article.wordCount })}</span>
                <span>{new Date(article.savedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
