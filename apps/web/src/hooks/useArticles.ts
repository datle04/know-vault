import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Types - match backend response shape
interface Article {
  id: string;
  userId: string;
  url: string;
  title: string | null;
  status: 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
  savedAt: string;
  processedAt: string | null;
  wordCount: number;
  readingTimeMin: number;
  language: string;
}

interface ArticleListResponse {
  articles: Article[];
  total: number;
  page: number;
  limit: number;
}

interface ArticleFilters {
  page?: number;
  limit?: number;
  search?: string;
}

interface SaveArticlePayload {
  url: string;
  title?: string;
  content: string;
  author?: string;
  siteName?: string;
}

export function useArticles(filters: ArticleFilters = {}) {
  return useQuery<ArticleListResponse>({
    queryKey: ['articles', filters],
    queryFn: () =>
      api.get<ArticleListResponse>('/articles', { params: filters }).then((r) => r.data),
    staleTime: 30_000,
    refetchInterval: (query) => {
      const articles = query.state.data?.articles ?? [];
      const hasInProgress = articles.some(
        (a) => a.status === 'PENDING' || a.status === 'PROCESSING',
      );
      return hasInProgress ? 5000 : false;
    },
  });
}

export function useSaveArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveArticlePayload) =>
      api.post<Article>('/articles', payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
}
