import { useState } from 'react';
import { X, Lock } from 'lucide-react';

interface Business {
  id: number;
  name: string;
  slug: string;
  whatsapp_number: string;
  description?: string | null;
  logo_url?: string | null;
}

interface EditBusinessModalProps {
  business: Business;
  onClose: () => void;
  onUpdate: (data: { name: string; whatsappNumber: string; description?: string; logoUrl?: string }) => Promise<void>;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function EditBusinessModal({ business, onClose, onUpdate, onSuccess, onError }: EditBusinessModalProps) {
  const [name, setName] = useState(business.name);
  const [whatsappNumber, setWhatsappNumber] = useState(business.whatsapp_number);
  const [description, setDescription] = useState(business.description || '');
  const [logoUrl, setLogoUrl] = useState(business.logo_url || '');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Logo must be less than 2MB');
      return;
    }

    try {
      setIsUploading(true);
      setError('');

      const fileExt = file.name.split('.').pop();
      const fileName = `${business.id}-${Math.random()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { supabase } = await import('../lib/supabase');

      const { error: uploadError } = await supabase.storage
        .from('whatsorder-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('whatsorder-media')
        .getPublicUrl(filePath);

      setLogoUrl(publicUrl);
    } catch (err) {
      console.error('Logo upload error:', err);
      setError('Failed to upload logo. Make sure a public "whatsorder-media" bucket exists in Supabase.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Business name is required');
      return;
    }

    if (name.length > 100) {
      setError('Business name must be 100 characters or less');
      return;
    }

    if (!whatsappNumber.trim()) {
      setError('WhatsApp number is required');
      return;
    }

    try {
      setLoading(true);
      await onUpdate({
        name: name.trim(),
        whatsappNumber: whatsappNumber.trim(),
        description: description.trim(),
        logoUrl: logoUrl,
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
          <h2 className="text-2xl font-bold text-gray-900">Edit Business Info</h2>
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

          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-2">
                  No Logo
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={isUploading}
                className="text-xs text-gray-500 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
              {isUploading && <p className="text-[10px] text-green-600 mt-1 animate-pulse">Uploading...</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="Your Business Name"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="Tell your customers about your business..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Public Link
            </label>
            <div className="flex items-center gap-2 bg-gray-50 px-4 py-3 border border-gray-200 rounded-lg">
              <Lock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500 text-sm flex-1 font-mono truncate">
                {window.location.origin}/{business.slug}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Link is locked to protect existing shares</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp Number
            </label>
            <input
              type="tel"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="+1234567890"
            />
            <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +1)</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isUploading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold transition-all shadow-lg shadow-green-600/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
