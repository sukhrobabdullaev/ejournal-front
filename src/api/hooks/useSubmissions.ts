import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, type Submission } from '../../lib/api';
import { API_ENDPOINTS } from '../endpoints';

export const QUERY_KEYS = {
  submissions: ['submissions'],
  submission: (id: string) => ['submissions', id],
};

export function useSubmissions() {
  return useQuery<Submission[]>({
    queryKey: QUERY_KEYS.submissions,
    queryFn: async () => {
      const { data, error } = await apiClient.get<Submission[]>(API_ENDPOINTS.submissions.list);
      if (error) {
        console.error('Error fetching submissions:', error);
        return [];
      }
      return data || [];
    },
  });
}

export function useSubmission(id: string) {
  return useQuery<Submission | null>({
    queryKey: QUERY_KEYS.submission(id),
    queryFn: async () => {
      const { data, error } = await apiClient.get<Submission>(
        API_ENDPOINTS.submissions.detail(id)
      );
      if (error) {
        console.error('Error fetching submission:', error);
        return null;
      }
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (submissionData?: Partial<Submission>) => {
      return await apiClient.post<Submission>(
        API_ENDPOINTS.submissions.create,
        submissionData || {}
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.submissions });
    },
  });
}

export function useUpdateSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Submission> }) => {
      return await apiClient.post<Submission>(API_ENDPOINTS.submissions.update(id), updates);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.submission(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.submissions });
    },
  });
}

export function useUploadSubmissionFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      file,
      fileType,
    }: {
      id: string;
      file: File;
      fileType: 'manuscript' | 'supplementary';
    }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('file_type', fileType);
      return await apiClient.post(API_ENDPOINTS.submissions.uploadFile(id), formData);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.submission(id) });
    },
  });
}

export function useSubmitSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.post<Submission>(API_ENDPOINTS.submissions.submit(id), {});
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.submission(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.submissions });
    },
  });
}

export function useResubmitSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.post<Submission>(API_ENDPOINTS.submissions.resubmit(id), {});
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.submission(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.submissions });
    },
  });
}

export function useDeleteSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.delete(API_ENDPOINTS.submissions.delete(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.submissions });
    },
  });
}
