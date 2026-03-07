import { useQuery } from '@tanstack/react-query';
import { apiClient, type Article, type TopicArea, type EditorialBoardMember } from '../../lib/api';
import { API_ENDPOINTS } from '../endpoints';

export const QUERY_KEYS = {
  articles: ['articles'],
  article: (slug: string) => ['articles', slug],
  topicAreas: ['topic-areas'],
  editorialBoard: (role?: string) => (role ? ['editorial-board', role] : ['editorial-board']),
};

export function useArticles() {
  return useQuery<Article[]>({
    queryKey: QUERY_KEYS.articles,
    queryFn: async () => {
      const { data, error } = await apiClient.get<Article[]>(API_ENDPOINTS.public.articles);
      if (error) {
        console.error('Error fetching articles:', error);
        return [];
      }
      return data || [];
    },
  });
}

export function useArticle(slug: string) {
  return useQuery<Article | null>({
    queryKey: QUERY_KEYS.article(slug),
    queryFn: async () => {
      const { data, error } = await apiClient.get<Article>(
        API_ENDPOINTS.public.articleDetail(slug)
      );
      if (error) {
        console.error('Error fetching article:', error);
        return null;
      }
      return data;
    },
    enabled: !!slug,
  });
}

export function useTopicAreas() {
  return useQuery<TopicArea[]>({
    queryKey: QUERY_KEYS.topicAreas,
    queryFn: async () => {
      const { data, error } = await apiClient.get<TopicArea[]>(API_ENDPOINTS.public.topicAreas);
      if (error) {
        console.error('Error fetching topic areas:', error);
        return [];
      }
      return data || [];
    },
  });
}

export function useEditorialBoard(role?: string) {
  return useQuery<EditorialBoardMember[]>({
    queryKey: QUERY_KEYS.editorialBoard(role),
    queryFn: async () => {
      const endpoint = role
        ? `${API_ENDPOINTS.public.editorialBoard}?role=${role}`
        : API_ENDPOINTS.public.editorialBoard;
      const { data, error } = await apiClient.get<EditorialBoardMember[]>(endpoint);
      if (error) {
        console.error('Error fetching editorial board:', error);
        return [];
      }
      return data || [];
    },
  });
}
