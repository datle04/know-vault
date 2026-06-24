'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { api } from '../../../../lib/api';

const saveSchema = z.object({
  url: z.string().refine(
    (val) => {
      try {
        const parsed = new URL(val);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        return false;
      }
    },
    { message: 'URL must start with http:// or https://' },
  ),
  title: z.string().min(1),
  content: z.string().min(1),
  author: z.string().optional(),
  siteName: z.string().optional(),
});

type SaveFormData = z.infer<typeof saveSchema>;

export default function SaveArticlePage() {
  const t = useTranslations('articles.save');
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SaveFormData>({
    resolver: zodResolver(saveSchema),
    mode: 'onBlur', // validate when field is unfocus
  });

  const onSubmit = async (data: SaveFormData) => {
    setServerError(null);
    try {
      await api.post('/articles', data);
      router.push('/dashboard');
    } catch (err: unknown) {
      const code = (err as { response?: { data?: { errorCode?: string } } })?.response?.data
        ?.errorCode;
      if (code === 'ARTICLE_ALREADY_SAVED') {
        setServerError(t('errors.alreadySaved'));
      } else {
        setServerError(t('errors.generic'));
      }
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">{t('title')}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('urlLabel')}</label>
          <input
            {...register('url')}
            type="url"
            placeholder={t('urlPlaceholder')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.url && <p className="text-xs text-red-500 mt-1">{errors.url.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('titleLabel')}</label>
          <input
            {...register('title')}
            placeholder={t('titlePlaceholder')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('authorLabel')}</label>
          <input
            {...register('author')}
            placeholder={t('authorPlaceholder')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('contentLabel')}
          </label>
          <textarea
            {...register('content')}
            placeholder={t('contentPlaceholder')}
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
          {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content.message}</p>}
        </div>

        {serverError && (
          <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{serverError}</p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? '...' : t('submitButton')}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {useTranslations('common')('cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}
