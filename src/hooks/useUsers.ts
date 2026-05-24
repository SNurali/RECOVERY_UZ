import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { toast } from 'sonner';

// Fetch all users
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get('/users');
      return data.data || data || [];
    },
  });
};

// Fetch masters
export const useMasters = () => {
  return useQuery({
    queryKey: ['users', 'masters'],
    queryFn: async () => {
      const { data } = await api.get('/users/masters');
      return data.data || data || [];
    },
  });
};

// Create user mutation
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData: any) => {
      const { data } = await api.post('/users', userData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Пользователь успешно создан');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Ошибка создания пользователя');
    },
  });
};
