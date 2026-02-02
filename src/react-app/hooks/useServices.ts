import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Service } from '@/shared/types';

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getHeaders = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
    return headers;
  }, []);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const headers = await getHeaders();
      const response = await fetch('/api/services', { headers });

      if (!response.ok) {
        throw new Error('We\'re having trouble loading your services.');
      }

      const data = await response.json();
      setServices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const addService = async (data: { name: string; startingPrice: number }) => {
    const headers = await getHeaders();
    const response = await fetch('/api/services', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add service');
    }

    const newService = await response.json();
    setServices([newService, ...services]);
    return newService;
  };

  const updateService = async (id: number, data: { name: string; startingPrice: number }) => {
    const headers = await getHeaders();
    const response = await fetch(`/api/services/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save changes');
    }

    const updatedService = await response.json();
    setServices(services.map(s => s.id === id ? updatedService : s));
    return updatedService;
  };

  const deleteService = async (id: number) => {
    const headers = await getHeaders();
    const response = await fetch(`/api/services/${id}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      throw new Error('Failed to delete service');
    }

    setServices(services.filter(s => s.id !== id));
  };

  return { services, loading, error, fetchServices, addService, updateService, deleteService };
}
