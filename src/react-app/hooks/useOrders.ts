import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Order } from '@/shared/types';

export function useOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
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

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const headers = await getHeaders();
            const response = await fetch('/api/orders/me', { headers });

            if (!response.ok) throw new Error('Failed to load orders');

            const data = await response.json();
            setOrders(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    }, [getHeaders]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const logOrder = async (data: { businessId: number; customerNote?: string; totalPrice: number; itemsSummary: string }) => {
        try {
            // Placing an order doesn't require auth on the public side
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Failed to log order internally');
            return await response.json();
        } catch (err) {
            console.error('Order logging error:', err);
            // We don't throw here to avoid blocking the WhatsApp redirect
        }
    };

    return { orders, loading, error, logOrder, refresh: fetchOrders };
}
