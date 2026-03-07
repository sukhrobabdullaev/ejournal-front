import { useMutation, useQuery, useQueryClient } from '@tantml:react-query';
import { apiClient, type ReviewAssignment } from '../../lib/api';
import { API_ENDPOINTS } from '../endpoints';

export const QUERY_KEYS = {
  assignments: ['reviewer-assignments'],
  assignment: (id: string) => ['reviewer-assignments', id],
};

export function useReviewAssignments() {
  return useQuery<ReviewAssignment[]>({
    queryKey: QUERY_KEYS.assignments,
    queryFn: async () => {
      const { data, error } = await apiClient.get<ReviewAssignment[]>(
        API_ENDPOINTS.reviewer.assignments
      );
      if (error) {
        console.error('Error fetching review assignments:', error);
        return [];
      }
      return data || [];
    },
  });
}

export function useReviewAssignment(id: string) {
  return useQuery<ReviewAssignment | null>({
    queryKey: QUERY_KEYS.assignment(id),
    queryFn: async () => {
      const { data, error } = await apiClient.get<ReviewAssignment>(
        API_ENDPOINTS.reviewer.assignmentDetail(id)
      );
      if (error) {
        console.error('Error fetching assignment:', error);
        return null;
      }
      return data;
    },
    enabled: !!id,
  });
}

export function useAcceptReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.post<ReviewAssignment>(
        API_ENDPOINTS.reviewer.accept(id),
        {}
      );
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assignment(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assignments });
    },
  });
}

export function useDeclineReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.post<ReviewAssignment>(
        API_ENDPOINTS.reviewer.decline(id),
        {}
      );
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assignment(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assignments });
    },
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      reviewData,
    }: {
      id: string;
      reviewData: {
        summary: string;
        strengths: string;
        weaknesses: string;
        confidential_to_editor: string;
        recommendation: 'accept' | 'minor_revision' | 'major_revision' | 'reject';
      };
    }) => {
      return await apiClient.post<ReviewAssignment>(
        API_ENDPOINTS.reviewer.submitReview(id),
        reviewData
      );
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assignment(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.assignments });
    },
  });
}

export function useAcceptByToken() {
  return useMutation({
    mutationFn: async (token: string) => {
      return await apiClient.post(API_ENDPOINTS.reviewer.acceptByToken, { token });
    },
  });
}

export function useDeclineByToken() {
  return useMutation({
    mutationFn: async (token: string) => {
      return await apiClient.post(API_ENDPOINTS.reviewer.declineByToken, { token });
    },
  });
}
