'use client';
import { useTranslations } from 'next-intl';

type ArticleStatus = 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED';

interface ArticleStatusBadgeProps {
  status: ArticleStatus;
}

const STATUS_STYLES: Record<ArticleStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  PROCESSING: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  PROCESSED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  FAILED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export function ArticleStatusBadge({ status }: ArticleStatusBadgeProps) {
  const t = useTranslations('articles.status');

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {status === 'PROCESSING' && (
        <span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
      )}
      {t(status)}
    </span>
  );
}
