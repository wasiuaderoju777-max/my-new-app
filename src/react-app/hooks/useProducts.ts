import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Product } from '@/shared/types';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
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

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const headers = await getHeaders();
      const response = await fetch('/api/products', { headers });

      if (!response.ok) {
        throw new Error('We\'re having trouble loading your products.');
      }

      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = async (data: { name: string; price: number; categoryId?: number; imageUrl?: string }) => {
    const headers = await getHeaders();
    const response = await fetch('/api/products', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add product');
    }

    const newProduct = await response.json();
    setProducts([newProduct, ...products]);
    return newProduct;
  };

  const updateProduct = async (id: number, data: { name: string; price: number; categoryId?: number; imageUrl?: string }) => {
    const headers = await getHeaders();
    const response = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save changes');
    }

    const updatedProduct = await response.json();
    setProducts(products.map(p => p.id === id ? updatedProduct : p));
    return updatedProduct;
  };

  const deleteProduct = async (id: number) => {
    const headers = await getHeaders();
    const response = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers
    });

    if (!response.ok) {
      throw new Error('Failed to delete product');
    }

    setProducts(products.filter(p => p.id !== id));
  };

  return { products, loading, error, fetchProducts, addProduct, updateProduct, deleteProduct };
}
