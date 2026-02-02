import { useState } from 'react';
import { X } from 'lucide-react';

interface AddServiceModalProps {
  onClose: () => void;
  onAdd: (data: { name: string; startingPrice: number }) => Promise<void>;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function AddServiceModal({ onClose, onAdd, onSuccess, onError }: AddServiceModalProps) {
  const [name, setName] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Service name is required');
      return;
    }

    if (name.length > 50) {
      setError('Service name must be 50 characters or less');
      return;
    }

    const priceNum = parseFloat(startingPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Starting price must be a positive number');
      return;
    }

    try {
      setLoading(true);
      await onAdd({ name: name.trim(), startingPrice: priceNum });
      onSuccess?.();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'We couldn\'t add your service right now. Please try again.';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add Service</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="e.g., Catering Service"
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1">{name.length}/50 characters</p>
          </div>

          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">₦</span>
            <input
              type="number"
              step="1"
              min="1"
              value={startingPrice}
              onChange={(e) => setStartingPrice(e.target.value)}
              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="0"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold transition-all shadow-lg shadow-green-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
