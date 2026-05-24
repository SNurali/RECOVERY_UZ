import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUIStore } from '../store/uiStore';

describe('useUIStore', () => {
  it('should toggle sidebar', () => {
    const { result } = renderHook(() => useUIStore());
    
    const initialState = result.current.sidebarOpen;
    
    act(() => {
      result.current.toggleSidebar();
    });
    
    expect(result.current.sidebarOpen).toBe(!initialState);
  });

  it('should change theme', () => {
    const { result } = renderHook(() => useUIStore());
    
    act(() => {
      result.current.setTheme('light');
    });
    
    expect(result.current.theme).toBe('light');
  });

  it('should add notification', () => {
    const { result } = renderHook(() => useUIStore());
    
    const initialCount = result.current.notifications.length;
    
    act(() => {
      result.current.addNotification({
        type: 'success',
        message: 'Test notification',
      });
    });
    
    expect(result.current.notifications.length).toBe(initialCount + 1);
  });

  it('should clear all notifications', () => {
    const { result } = renderHook(() => useUIStore());
    
    act(() => {
      result.current.addNotification({
        type: 'info',
        message: 'Test 1',
      });
      result.current.addNotification({
        type: 'info',
        message: 'Test 2',
      });
    });
    
    act(() => {
      result.current.clearNotifications();
    });
    
    expect(result.current.notifications).toHaveLength(0);
  });
});
