import { useState } from 'react';
import Logo from './Logo';

interface SetupBusinessModalProps {
  onSetup: (data: { name: string; slug: string; whatsappNumber: string; description?: string; logoUrl?: string }) => Promise<void>;
}

export default function SetupBusinessModal({ onSetup }: SetupBusinessModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError('');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
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
      setError('Logo upload failed. You can skip this for now.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleNameChange = (value: string) => {
    setName(value);
    const autoSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);
    setSlug(autoSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError('Business name is required');
    if (!slug.trim()) return setError('Link slug is required');
    if (!name.trim()) return setError('Business name is required');
    if (!slug.trim()) return setError('Link slug is required');

    // Strict WhatsApp validation: Digits only, length check (approx 10-15 chars)
    const waClean = whatsappNumber.replace(/\D/g, '');
    if (!waClean || waClean.length < 10 || waClean.length > 15) {
      return setError('Enter a valid WhatsApp number (e.g. 2348012345678). Use digits only.');
    }

    // We update the state with the clean number just to be safe before sending?
    // Actually the parent handles it, but let's send the clean one.
    // However, the prop expects `whatsappNumber` as the state.
    // Let's just validate what is in the state.
    if (!/^\d+$/.test(whatsappNumber)) {
      return setError('WhatsApp number must contain digits only. No + or spaces.');
    }

    try {
      setLoading(true);
      await onSetup({
        name: name.trim(),
        slug: slug.trim(),
        whatsappNumber: whatsappNumber.trim(),
        description: description.trim(),
        logoUrl: logoUrl,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Business setup failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 border border-green-100 my-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-600/20">
            <Logo className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Launch Your Store</h2>
            <p className="text-gray-500 font-medium">Just a few details to get started</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-bold">
              {error}
            </div>
          )}

          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="w-16 h-16 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-gray-200 flex items-center justify-center">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] text-gray-400 font-black text-center p-2 uppercase tracking-tighter">New Store</span>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Company Logo (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="text-[10px] text-gray-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-green-600 file:text-white hover:file:bg-green-700 transition-all cursor-pointer"
              />
              {isUploading && <p className="text-[10px] text-green-600 mt-1 font-bold animate-pulse">Uploading branding...</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Business Identity</label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-bold placeholder:font-normal"
              placeholder="e.g. Mama Cass Kitchen"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Business Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm"
              placeholder="Tell your customers what you sell..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Public Link</label>
              <div className="relative">
                <span className="absolute left-4 top-4 text-gray-400 font-mono text-xs">/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase())}
                  className="w-full pl-7 pr-5 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-mono text-sm text-green-600 font-bold"
                  placeholder="link-name"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">WhatsApp No.</label>
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-bold"
                placeholder="2348012345678"
              />
              <p className="text-[9px] text-gray-400 mt-1 font-medium">International format without '+' (e.g., 234...)</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || isUploading}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-5 rounded-2xl font-black transition-all shadow-xl shadow-green-600/30 disabled:opacity-50 disabled:cursor-not-allowed mt-8 uppercase tracking-widest text-sm"
          >
            {loading ? 'Processing...' : 'Create My Store'}
          </button>
        </form>
      </div>
    </div>
  );
}
