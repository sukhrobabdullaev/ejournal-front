import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { apiClient, TokenManager, type User } from '../../lib/api';
import { API_ENDPOINTS } from '../endpoints';

interface SignupData {
  email: string;
  password: string;
  full_name: string;
  affiliation: string;
  country: string;
  roles: string[];
  why_to_be?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface TokenResponse {
  access: string;
  refresh: string;
}

export const QUERY_KEYS = {
  currentUser: ['me'],
  myRole: ['my-role'],
};

export function useCurrentUser() {
  return useQuery<User | null>({
    queryKey: QUERY_KEYS.currentUser,
    queryFn: async () => {
      const { data, error } = await apiClient.get<User>(API_ENDPOINTS.auth.me);
      if (error) {
        console.error('Error fetching current user:', error);
        return null;
      }
      return data;
    },
    retry: false,
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: async (data: SignupData) => {
      return await apiClient.post(API_ENDPOINTS.auth.signup, data);
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, password }: LoginData) => {
      const result = await apiClient.post<TokenResponse>(API_ENDPOINTS.auth.login, {
        email,
        password,
      });

      if (result.data) {
        TokenManager.setTokens(result.data.access, result.data.refresh);
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.currentUser });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      TokenManager.clearTokens();
    },
    onSuccess: () => {
      queryClient.clear();
      navigate('/login');
    },
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: async (token: string) => {
      return await apiClient.post(API_ENDPOINTS.auth.verifyEmail, { token });
    },
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: async (email: string) => {
      return await apiClient.post(API_ENDPOINTS.auth.resendVerification, { email });
    },
  });
}

export function useMyRole() {
  const { data: user } = useCurrentUser();
  
  return useQuery<string | null>({
    queryKey: QUERY_KEYS.myRole,
    queryFn: () => {
      return user?.roles?.[0] || null;
    },
    enabled: !!user,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      updates: Partial<Pick<User, 'full_name' | 'affiliation' | 'country' | 'orcid_id'>>
    ) => {
      return await apiClient.patch<User>(API_ENDPOINTS.auth.me, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.currentUser });
    },
  });
}

export async function isAuthenticated(): Promise<boolean> {
  const token = TokenManager.getAccessToken();
  if (!token) return false;

  const { data } = await apiClient.get<User>(API_ENDPOINTS.auth.me);
  return data !== null;
}
