import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Business } from '@/shared/types';

export function useBusiness() {
  const [business, setBusiness] = useState<Business | null>(null);
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

  const fetchBusiness = useCallback(async () => {
    try {
      setLoading(true);
      const headers = await getHeaders();
      const response = await fetch('/api/businesses/me', { headers });

      if (!response.ok) {
        if (response.status === 404) {
          setBusiness(null);
          return;
        }
        throw new Error('We\'re having trouble loading your business data.');
      }

      const data = await response.json();
      setBusiness(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  useEffect(() => {
    fetchBusiness();
  }, [fetchBusiness]);

  const createBusiness = async (data: { name: string; slug: string; whatsappNumber: string; description?: string; logoUrl?: string }) => {
    const headers = await getHeaders();
    const response = await fetch('/api/businesses', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create business');
    }

    const newBusiness = await response.json();
    setBusiness(newBusiness);
    return newBusiness;
  };

  const updateBusiness = async (data: { name: string; whatsappNumber: string; description?: string; logoUrl?: string }) => {
    const headers = await getHeaders();
    const response = await fetch('/api/businesses', {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update business');
    }

    const updatedBusiness = await response.json();
    setBusiness(updatedBusiness);
    return updatedBusiness;
  };

  return { business, loading, error, fetchBusiness, createBusiness, updateBusiness };
}
