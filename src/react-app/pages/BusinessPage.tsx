import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Minus } from 'lucide-react';
import Logo from '../components/Logo';
import { useOrders } from '../hooks/useOrders';
import * as Shared from '../../shared/types';

interface BusinessData {
  business: Shared.Business;
  products: Shared.Product[];
  services: Shared.Service[];
  categories: Shared.Category[];
}

export default function BusinessPage() {
  const { slug } = useParams();
  const [data, setData] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const { logOrder } = useOrders();

  useEffect(() => {
    const fetchBusinessInfo = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/businesses/${slug}`);
        if (!response.ok) {
          setError(response.status === 404 ? 'Store not found' : 'Error loading store');
          return;
        }
        const json = await response.json();
        setData(json);
      } catch {
        setError('Connection error');
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchBusinessInfo();
  }, [slug]);

  const updateQuantity = (id: number, delta: number) => {
    setQuantities(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }));
  };

  const selectedItems = data?.products.filter(p => (quantities[p.id] || 0) > 0) || [];
  const totalCount = selectedItems.reduce((sum, p) => sum + (quantities[p.id] || 0), 0);
  const totalPrice = selectedItems.reduce((sum, p) => sum + (p.price * (quantities[p.id] || 0)), 0);

  const handleOrder = async () => {
    if (!data) return;
    const bullet = '\u2022';
    const dash = '\u2014';
    const separator = '----------------';
    const naira = '\u20A6';

    const itemsText = selectedItems
      .map(p => `${bullet} ${quantities[p.id]}x ${p.name} ${dash} ${naira}${(p.price * quantities[p.id]).toLocaleString()}`)
      .join('\n');

    const msg = `*New Order for ${data.business.name}*
Customer: ${customerName || 'N/A'} (${customerPhone || 'N/A'})
Address: ${customerNote || 'N/A'}
${separator}
${itemsText}
${separator}
*Total Amount: ${naira}${totalPrice.toLocaleString()}*

*Delivery Details:*
${customerNote || 'N/A'}

_Sent via WhatsOrder_`;

    try {
      setIsSubmitting(true);
      await logOrder({
        businessId: data.business.id,
        customerNote,
        totalPrice,
        itemsSummary: itemsText
      });
      window.open(`https://wa.me/${data.business.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-gray-400">LOADING...</div>;
  if (error || !data) return <div className="min-h-screen flex items-center justify-center font-black text-red-400 p-8 text-center">{error || 'STORE NOT FOUND'}</div>;

  const categoriesWithProducts = [
    ...data.categories.map(cat => ({
      ...cat,
      products: data.products.filter(p => p.category_id === cat.id)
    })).filter(c => c.products.length > 0),
    // Add uncategorized products
    ...(data.products.filter(p => !p.category_id).length > 0 ? [{
      id: 0,
      name: 'All Products',
      products: data.products.filter(p => !p.category_id)
    }] : [])
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-[30rem]">
      <header className="bg-white p-4 border-b border-gray-100 flex items-center gap-4 sticky top-0 z-50">
        <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center overflow-hidden">
          {data.business.logo_url ? <img src={data.business.logo_url} className="w-full h-full object-cover" /> : <Logo className="w-6 h-6" />}
        </div>
        <h1 className="text-xl font-black text-gray-900 truncate">{data.business.name}</h1>
      </header>

      <main className="max-w-xl mx-auto p-4">
        {data.business.description && <p className="bg-white p-5 rounded-2xl mb-8 text-gray-500 text-sm leading-relaxed border border-gray-100">{data.business.description}</p>}

        {categoriesWithProducts.map(cat => (
          <section key={cat.id} className="mb-8">
            <h2 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4 ml-2">{cat.name}</h2>
            <div className="grid gap-3">
              {cat.products.map(p => (
                <div key={p.id} className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                    {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{p.name}</h3>
                    <p className="text-green-600 font-black">₦{p.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-2xl">
                    <button onClick={() => updateQuantity(p.id, -1)} className="w-10 h-10 flex items-center justify-center font-black text-gray-400"><Minus className="w-4 h-4" /></button>
                    <span className="w-6 text-center font-black">{quantities[p.id] || 0}</span>
                    <button onClick={() => updateQuantity(p.id, 1)} className="w-10 h-10 bg-green-500 text-white rounded-xl flex items-center justify-center"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Floating View Order Button */}
      <div className={`fixed bottom-8 left-0 right-0 px-4 z-40 transition-all duration-500 ${totalCount > 0 && !showCheckout ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
        <button
          onClick={() => setShowCheckout(true)}
          className="max-w-xl mx-auto w-full bg-green-600 text-white py-4 rounded-2xl font-black shadow-2xl shadow-green-600/40 flex items-center justify-between px-6 active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-3">
            <span className="bg-white/20 px-2 py-0.5 rounded-lg text-sm">{totalCount}</span>
            <span className="uppercase tracking-widest text-xs">View Order</span>
          </div>
          <span className="text-lg">₦{totalPrice.toLocaleString()}</span>
        </button>
      </div>

      {/* Checkout Side Drawer */}
      <div
        className={`fixed inset-0 z-[60] transition-all duration-300 ${showCheckout ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={() => setShowCheckout(false)}
        />

        <div className={`absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl transition-all duration-500 transform flex flex-col ${showCheckout ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex-1 overflow-y-auto p-8">
            <div className="flex justify-between items-start mb-10">
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Items</p>
                <p className="font-black text-4xl text-gray-900">{totalCount}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Subtotal</p>
                <p className="font-black text-green-600 text-4xl">₦{totalPrice.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-6 mb-10">
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3 ml-2">Your Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full px-6 py-5 bg-gray-50 rounded-2xl text-base outline-none border border-gray-100 focus:border-green-500 focus:bg-white transition-all placeholder:text-gray-300 font-bold"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3 ml-2">Phone Number</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full px-6 py-5 bg-gray-50 rounded-2xl text-base outline-none border border-gray-100 focus:border-green-500 focus:bg-white transition-all placeholder:text-gray-300 font-bold"
                  placeholder="08012345678"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3 ml-2">Delivery Address</label>
                <textarea
                  value={customerNote}
                  onChange={e => setCustomerNote(e.target.value)}
                  className="w-full px-6 py-5 bg-gray-50 rounded-2xl text-base outline-none border border-gray-100 focus:border-green-500 focus:bg-white transition-all placeholder:text-gray-300 resize-none font-bold"
                  placeholder="House address, landmark, etc..."
                  rows={4}
                />
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-3xl mb-10">
              <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">Order Summary</h3>
              <div className="space-y-3">
                {selectedItems.map(p => (
                  <div key={p.id} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-medium">{quantities[p.id]}x {p.name}</span>
                    <span className="text-gray-900 font-bold">₦{(p.price * quantities[p.id]).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-8 border-t border-gray-100 bg-white">
            <button
              onClick={handleOrder}
              disabled={isSubmitting || totalCount === 0 || !customerName || !customerPhone}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {isSubmitting ? 'Processing...' : 'Complete Order via WhatsApp'}
            </button>
            <button
              onClick={() => setShowCheckout(false)}
              className="w-full mt-4 text-gray-400 font-bold text-xs uppercase tracking-widest py-2"
            >
              Back to menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
