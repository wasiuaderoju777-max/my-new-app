import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  message: string;
  type: 'error' | 'success' | 'info';
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'error' | 'success' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Log errors to console for debugging
    if (type === 'error') {
      console.error('Toast Error:', message);
    }
    
    return id;
  }, []);

  const showError = useCallback((message: string) => {
    return showToast(message, 'error');
  }, [showToast]);

  const showSuccess = useCallback((message: string) => {
    return showToast(message, 'success');
  }, [showToast]);

  const showInfo = useCallback((message: string) => {
    return showToast(message, 'info');
  }, [showToast]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return {
    toasts,
    showToast,
    showError,
    showSuccess,
    showInfo,
    removeToast,
  };
}
