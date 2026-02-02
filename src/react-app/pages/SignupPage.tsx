import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Building2, Mail, Lock, Phone } from 'lucide-react';
import Logo from '../components/Logo';

export default function SignupPage() {
  const navigate = useNavigate();
  const { user, loading, signUp } = useAuth();

  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    password: '',
    confirmPassword: '',
    whatsappNumber: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (user && !loading && !isSubmitting) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate, isSubmitting]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validate = () => {
    if (!formData.businessName.trim()) return "Business Name is required";
    if (!formData.email.includes('@')) return "Invalid email format";
    if (formData.password.length < 8) return "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword) return "Passwords do not match";
    if (!/^\d+$/.test(formData.whatsappNumber)) return "WhatsApp number must be numeric";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus('Validating details...');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setStatus(null);
      return;
    }

    try {
      setIsSubmitting(true);
      setStatus('Creating your account...');

      // 1. Sign up user
      const authData = await signUp({
        email: formData.email,
        password: formData.password,
      });

      const session = authData.data.session;
      const user = authData.data.user;

      // Case A: Email verification required (User created, no session)
      if (user && !session) {
        setStatus('Account created! Please check your email to verify.');
        // Don't try to create business yet. Just show success message.
        setError(null);
        setIsSubmitting(false);
        // We can create a dedicated success UI state or just alert and redirect to login
        alert("Account created successfully! Please check your email to verify your account before logging in.");
        navigate('/login');
        return;
      }

      // Case B: Immediate session (Auto-confirm enabled)
      if (session) {
        const token = session.access_token;
        setStatus('Setting up your business profile...');

        // 2. Create business profile
        const slug = formData.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-');

        const response = await fetch('/api/businesses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: formData.businessName,
            slug: slug,
            whatsappNumber: formData.whatsappNumber,
          }),
        });

        if (!response.ok) {
          // If business creation fails, we still have the user.
          // They will just see the Setup Modal on dashboard.
          // So we can arguably ignore this error or log it.
          // But let's try to be robust. 
          console.error("Business setup failed slightly, but user exists.");
        }

        setStatus('Success! Redirecting...');
        navigate('/dashboard');
      } else {
        throw new Error('Unexpected signup state. Please try logging in.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';

      if (message.toLowerCase().includes('already registered')) {
        setError("This email is already in use. Please try logging in or use a different email.");
      } else {
        setError(message);
        // Add extreme visibility for the user
        alert(`SIGNUP ERROR: ${message}`);
      }
      setStatus(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex flex-col">
      <header className="border-b border-green-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/" className="flex items-center gap-2 w-fit">
            <Logo className="w-10 h-10" />
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              WhatsOrder
            </span>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h1>
            <p className="text-gray-600 mb-6">Join thousands of vendors selling on WhatsApp</p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            {isSubmitting && status && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm text-center animate-pulse">
                {status}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="businessName"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Mama Cass Kitchen"
                    value={formData.businessName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Owner Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="owner@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number (with country code)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="whatsappNumber"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="2348012345678"
                    value={formData.whatsappNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={8}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-600/30 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : 'Create Account'}
              </button>
            </form>

            <p className="mt-6 text-center text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
