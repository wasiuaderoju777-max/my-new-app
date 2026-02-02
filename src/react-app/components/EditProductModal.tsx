import { useState } from 'react';
import { X } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  category_id?: number | null;
  image_url?: string | null;
}

interface EditProductModalProps {
  product: Product;
  onClose: () => void;
  onUpdate: (id: number, data: { name: string; price: number; categoryId?: number; imageUrl?: string }) => Promise<void>;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  categories: { id: number; name: string }[];
}

export default function EditProductModal({ product, onClose, onUpdate, onSuccess, onError, categories }: EditProductModalProps) {
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(product.price.toString());
  const [categoryId, setCategoryId] = useState<string>(product.category_id?.toString() || '');
  const [imageUrl, setImageUrl] = useState(product.image_url || '');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB');
      return;
    }

    try {
      setIsUploading(true);
      setError('');

      const fileExt = file.name.split('.').pop();
      const fileName = `${product.id}-${Math.random()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { supabase } = await import('../lib/supabase');

      const { error: uploadError } = await supabase.storage
        .from('whatsorder-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('whatsorder-media')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
    } catch (err) {
      console.error('Image upload error:', err);
      setError('Failed to upload image. Ensure "whatsorder-media" bucket exists.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Product name is required');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Price must be a positive number');
      return;
    }

    try {
      setLoading(true);
      await onUpdate(product.id, {
        name: name.trim(),
        price: priceNum,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        imageUrl
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'We couldn\'t save your changes right now. Please try again.';
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
          <h2 className="text-xl font-bold text-gray-900">Edit Product</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <div className="flex items-center gap-4 mb-2">
            <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200 flex items-center justify-center">
              {imageUrl ? (
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] text-gray-400 font-bold text-center p-1">No Image</span>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Update Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="text-[10px] text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-green-50 file:text-green-700 hover:file:bg-green-100 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="e.g. Classic Burger"
              maxLength={50}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500 font-bold">₦</span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category (Optional)</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all appearance-none bg-white"
              >
                <option value="">Uncategorized</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id.toString()}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isUploading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl font-bold transition-all shadow-lg shadow-green-600/30 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
