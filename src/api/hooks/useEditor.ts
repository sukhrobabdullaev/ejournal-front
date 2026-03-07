import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, type Submission } from '../../lib/api';
import { API_ENDPOINTS } from '../endpoints';

export const QUERY_KEYS = {
  editorSubmissions: ['editor-submissions'],
  editorSubmission: (id: string) => ['editor-submissions', id],
};

export function useEditorSubmissions(status?: string) {
  return useQuery<Submission[]>({
    queryKey: status ? [...QUERY_KEYS.editorSubmissions, status] : QUERY_KEYS.editorSubmissions,
    queryFn: async () => {
      const endpoint = status
        ? `${API_ENDPOINTS.editor.submissions}?status=${status}`
        : API_ENDPOINTS.editor.submissions;
      const { data, error } = await apiClient.get<Submission[]>(endpoint);
      if (error) {
        console.error('Error fetching editor submissions:', error);
        return [];
      }
      return data || [];
    },
  });
}

export function useEditorSubmission(id: string) {
  return useQuery<Submission | null>({
    queryKey: QUERY_KEYS.editorSubmission(id),
    queryFn: async () => {
      const { data, error } = await apiClient.get<Submission>(
        API_ENDPOINTS.editor.submissionDetail(id)
      );
      if (error) {
        console.error('Error fetching submission for editor:', error);
        return null;
      }
      return data;
    },
    enabled: !!id,
  });
}

export function useStartScreening() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.post<Submission>(API_ENDPOINTS.editor.startScreening(id), {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.editorSubmissions });
    },
  });
}

export function useDeskReject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      return await apiClient.post<Submission>(API_ENDPOINTS.editor.deskReject(id), { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.editorSubmissions });
    },
  });
}

export function useSendToReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.post<Submission>(API_ENDPOINTS.editor.sendToReview(id), {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.editorSubmissions });
    },
  });
}

export function useInviteReviewer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      submissionId,
      data,
    }: {
      submissionId: string;
      data: { reviewer_user_id?: number; reviewer_email?: string; due_date: string };
    }) => {
      return await apiClient.post(API_ENDPOINTS.editor.inviteReviewer(submissionId), data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.editorSubmissions });
    },
  });
}

export function useMoveToDecision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.post<Submission>(API_ENDPOINTS.editor.moveToDecision(id), {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.editorSubmissions });
    },
  });
}

export function useMakeEditorialDecision() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      decision,
      decisionLetter,
    }: {
      id: string;
      decision: 'accept' | 'reject' | 'revision_required';
      decisionLetter: string;
    }) => {
      return await apiClient.post<Submission>(API_ENDPOINTS.editor.makeDecision(id), {
        decision,
        decision_letter: decisionLetter,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.editorSubmissions });
    },
  });
}

export function usePublishSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.post<Submission>(API_ENDPOINTS.editor.publish(id), {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.editorSubmissions });
    },
  });
}

export function useRemindReviewer() {
  return useMutation({
    mutationFn: async (assignmentId: string) => {
      return await apiClient.post(API_ENDPOINTS.editor.remindReviewer(assignmentId), {});
    },
  });
}
