import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { toast } from 'sonner';

// Fetch all clients
export const useClients = () => {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data } = await api.get('/clients');
      return data.data || data || [];
    },
  });
};

// Create client mutation
export const useCreateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (clientData: any) => {
      const { data } = await api.post('/clients', clientData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Клиент успешно добавлен');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Ошибка добавления клиента');
    },
  });
};
