import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Category } from '@/shared/types';

export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
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

    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            const headers = await getHeaders();
            const response = await fetch('/api/categories', { headers });

            if (!response.ok) throw new Error('Failed to load categories');

            const data = await response.json();
            setCategories(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    }, [getHeaders]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const addCategory = async (name: string) => {
        const headers = await getHeaders();
        const response = await fetch('/api/categories', {
            method: 'POST',
            headers,
            body: JSON.stringify({ name }),
        });

        if (!response.ok) throw new Error('Failed to add category');

        const newCategory = await response.json();
        setCategories(prev => [...prev, newCategory]);
        return newCategory;
    };

    const deleteCategory = async (id: number) => {
        const headers = await getHeaders();
        const response = await fetch(`/api/categories/${id}`, {
            method: 'DELETE',
            headers,
        });

        if (!response.ok) throw new Error('Failed to delete category');

        setCategories(prev => prev.filter(c => c.id !== id));
    };

    return { categories, loading, error, addCategory, deleteCategory, refresh: fetchCategories };
}
