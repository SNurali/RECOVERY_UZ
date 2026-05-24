import { create } from 'zustand';

interface FilterState {
  orderFilters: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    clientId?: string;
    masterId?: string;
  };
  clientFilters: {
    search?: string;
  };
  setOrderFilters: (filters: Partial<FilterState['orderFilters']>) => void;
  clearOrderFilters: () => void;
  setClientFilters: (filters: Partial<FilterState['clientFilters']>) => void;
  clearClientFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  orderFilters: {},
  clientFilters: {},
  
  setOrderFilters: (filters) =>
    set((state) => ({
      orderFilters: { ...state.orderFilters, ...filters },
    })),
  
  clearOrderFilters: () => set({ orderFilters: {} }),
  
  setClientFilters: (filters) =>
    set((state) => ({
      clientFilters: { ...state.clientFilters, ...filters },
    })),
  
  clearClientFilters: () => set({ clientFilters: {} }),
}));
