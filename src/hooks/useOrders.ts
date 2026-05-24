import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { toast } from 'sonner';

export interface Order {
  id: string;
  order_date: string;
  status: string;
  price_approved_at: string | null;
  price_rejected_at: string | null;
  total_price_uzs: number;
  total_paid_uzs: number;
  client: any;
  details: any[];
}

// Fetch all orders
export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data } = await api.get('/orders');
      return (data.data || data || []) as Order[];
    },
  });
};

// Fetch single order
export const useOrder = (id: string | undefined) => {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: async () => {
      if (!id) throw new Error('Order ID is required');
      const { data } = await api.get(`/orders/${id}`);
      return data.data || data;
    },
    enabled: !!id,
  });
};

// Fetch order stats
export const useOrderStats = () => {
  return useQuery({
    queryKey: ['orders', 'stats'],
    queryFn: async () => {
      const { data } = await api.get('/orders/stats');
      return data.data || data;
    },
  });
};

// Create order mutation
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderData: any) => {
      const { data } = await api.post('/orders', orderData);
      return data.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Заказ успешно создан');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Ошибка создания заказа');
    },
  });
};

// Update order status mutation
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await api.patch(`/orders/${id}`, { status });
      return data.data || data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', variables.id] });
      toast.success('Статус обновлен');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Ошибка обновления статуса');
    },
  });
};

// Set price mutation
export const useSetPrice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, details }: { id: string; details: any[] }) => {
      const { data } = await api.post(`/orders/${id}/set-price`, { details });
      return data.data || data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', variables.id] });
      toast.success('Цена установлена');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Ошибка установки цены');
    },
  });
};

// Approve price mutation
export const useApprovePrice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/orders/${id}/approve-price`);
      return data.data || data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', id] });
      toast.success('Цена одобрена');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Ошибка одобрения цены');
    },
  });
};

// Reject price mutation
export const useRejectPrice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/orders/${id}/reject-price`);
      return data.data || data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', id] });
      toast.success('Цена отклонена');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Ошибка отклонения цены');
    },
  });
};
