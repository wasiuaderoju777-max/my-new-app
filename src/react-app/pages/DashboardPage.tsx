import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Trash2, Edit2, Copy, Check, Settings, Briefcase } from 'lucide-react';
import Logo from '../components/Logo';
import { useBusiness } from '../hooks/useBusiness';
import { useProducts } from '../hooks/useProducts';
import { useServices } from '../hooks/useServices';
import { useCategories } from '../hooks/useCategories';
import { useOrders } from '../hooks/useOrders';
import { useToast } from '../hooks/useToast';
import AddProductModal from '../components/AddProductModal';
import AddServiceModal from '../components/AddServiceModal';
import AddCategoryModal from '../components/AddCategoryModal';
import EditProductModal from '../components/EditProductModal';
import EditBusinessModal from '../components/EditBusinessModal';
import SetupBusinessModal from '../components/SetupBusinessModal';
import ToastContainer from '../components/ToastContainer';
import * as Shared from '../../shared/types';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, loading: authPending, signOut } = useAuth();
  const { business, loading: bLoading, createBusiness, updateBusiness } = useBusiness();

  const [tab, setTab] = useState<'products' | 'services' | 'categories' | 'orders'>('products');
  const [showAddP, setShowAddP] = useState(false);
  const [showAddS, setShowAddS] = useState(false);
  const [showAddC, setShowAddC] = useState(false);
  const [editingP, setEditingP] = useState<Shared.Product | null>(null);
  const [editingB, setEditingB] = useState(false);
  const [copied, setCopied] = useState(false);

  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { addService } = useServices();
  const { categories, addCategory, deleteCategory } = useCategories();
  const { orders, refresh: refreshOrders } = useOrders();
  const { toasts, showError, showSuccess, removeToast } = useToast();

  useEffect(() => {
    if (!user && !authPending) {
      navigate('/login');
    } else if (user && !bLoading && !business) {
      // User logged in, data loaded, but no business.
      // Check if they've seen the intro.
      // Check if they've seen the intro.
      const introSeen = localStorage.getItem('whatsorder_intro_seen');
      if (!introSeen) {
        navigate('/onboarding');
        return; // Exit effect
      }
    }
  }, [user, authPending, bLoading, business, navigate]);

  // If business is null (and we are not redirecting/loading), show setup
  // We need to check !business again here for the render

  if (authPending || bLoading) return <div className="min-h-screen flex items-center justify-center font-black text-gray-400">LOADING HUB...</div>;
  if (!user) return null;

  if (!business) {
    const introSeen = localStorage.getItem('whatsorder_intro_seen');
    if (!introSeen) return null; // Wait for redirect
    return <><SetupBusinessModal onSetup={createBusiness} /><ToastContainer toasts={toasts} onRemove={removeToast} /></>;
  }



  if (authPending || bLoading) return <div className="min-h-screen flex items-center justify-center font-black text-gray-400">LOADING HUB...</div>;

  if (!user) {
    // This should have redirected, but if not:
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p>Please log in.</p>
        <button onClick={() => navigate('/login')} className="mt-4 p-2 bg-green-500 text-white rounded">Login</button>
      </div>
    );
  }

  // Business is guaranteed to be present here due to the check above
  // Business is guaranteed to be present here due to the check above

  const publicUrl = `${window.location.origin}/${business.slug}`;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white p-4 border-b border-gray-100 flex justify-between items-center sticky top-0 z-30">
        <Link to="/" className="flex items-center gap-2"><Logo className="w-8 h-8" /><span className="font-black text-xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">WhatsOrder</span></Link>
        <button onClick={() => signOut()} className="text-[10px] font-black uppercase tracking-widest text-gray-400">Logout</button>
      </header>

      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
            <div className="flex gap-6">
              <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center overflow-hidden border border-green-100">
                {business.logo_url ? <img src={business.logo_url} className="w-full h-full object-cover" /> : <Briefcase className="w-8 h-8 text-green-200" />}
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 leading-tight mb-1">{business.name}</h1>
                <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">{business.whatsapp_number}</p>
              </div>
            </div>
            <button onClick={() => setEditingB(true)} className="px-6 py-3 bg-gray-50 rounded-xl font-black text-[10px] uppercase border border-gray-100 flex items-center gap-2 h-fit"><Settings className="w-4 h-4" /> Settings</button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 bg-gray-50 p-4 rounded-xl flex items-center justify-between">
              <span className="font-mono text-xs text-gray-500 truncate">{publicUrl}</span>
              <button onClick={() => { navigator.clipboard.writeText(publicUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="p-2 bg-white rounded-lg shadow-sm">{copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-400" />}</button>
            </div>
            <a href={publicUrl} target="_blank" className="bg-green-600 text-white px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-green-600/20 text-center">Visit Store</a>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden min-h-[500px] flex flex-col">
          <div className="flex bg-gray-50/50 border-b border-gray-100 overflow-x-auto">
            {['products', 'services', 'categories', 'orders'].map(t => (
              <button key={t} onClick={() => { setTab(t as 'products' | 'services' | 'categories' | 'orders'); if (t === 'orders') refreshOrders(); }} className={`flex-1 py-6 font-black text-[10px] uppercase tracking-widest ${tab === t ? 'bg-white text-green-600 border-b-2 border-green-600' : 'text-gray-400'}`}>{t}</button>
            ))}
          </div>
          <div className="p-10 flex-1">
            {tab === 'products' && (
              <div>
                <div className="flex justify-between items-center mb-8"><h2 className="text-2xl font-black">Products</h2><button onClick={() => setShowAddP(true)} className="bg-green-600 text-white px-5 py-3 rounded-xl font-black uppercase text-[10px]">Add</button></div>
                <div className="grid gap-3">
                  {products.map(p => (
                    <div key={p.id} className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden">{p.image_url && <img src={p.image_url} className="w-full h-full object-cover" />}</div>
                        <div><h3 className="font-black uppercase text-xs">{p.name}</h3><p className="text-green-600 font-black text-sm">₦{p.price.toLocaleString()}</p></div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingP(p)} className="p-2.5 bg-gray-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => deleteProduct(p.id)} className="p-2.5 bg-gray-50 rounded-lg text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {tab === 'categories' && (
              <div>
                <button onClick={() => setShowAddC(true)} className="mb-8 bg-green-600 text-white px-5 py-3 rounded-xl font-black uppercase text-[10px]">New Category</button>
                <div className="grid gap-2">
                  {categories.map(c => (
                    <div key={c.id} className="p-5 bg-white border border-gray-100 rounded-xl flex justify-between items-center"><span className="font-black uppercase text-sm">{c.name}</span><button onClick={() => deleteCategory(c.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></button></div>
                  ))}
                </div>
              </div>
            )}
            {tab === 'orders' && (
              <div className="space-y-4">
                {orders.map(o => (
                  <div key={o.id} className="p-6 bg-white border border-gray-100 rounded-2xl">
                    <pre className="p-4 bg-gray-50 rounded-xl text-[10px] font-mono whitespace-pre-wrap">{o.items_summary}</pre>
                    <div className="flex justify-between mt-4 text-[10px] font-black uppercase text-gray-400"><span>ID: {o.id}</span><span className="text-green-600">₦{o.total_price.toLocaleString()}</span></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddP && <AddProductModal onClose={() => setShowAddP(false)} onAdd={addProduct} onSuccess={() => showSuccess('Added')} onError={showError} categories={categories} />}
      {showAddS && <AddServiceModal onClose={() => setShowAddS(false)} onAdd={addService} onSuccess={() => showSuccess('Added')} onError={showError} />}
      {showAddC && <AddCategoryModal onClose={() => setShowAddC(false)} onAdd={addCategory} onSuccess={() => showSuccess('Added')} onError={showError} />}
      {editingP && <EditProductModal product={editingP} onClose={() => setEditingP(null)} onUpdate={updateProduct} onSuccess={() => showSuccess('Updated')} onError={showError} categories={categories} />}
      {editingB && <EditBusinessModal business={business as Shared.Business} onClose={() => setEditingB(false)} onUpdate={updateBusiness} onSuccess={() => showSuccess('Saved')} onError={showError} />}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
