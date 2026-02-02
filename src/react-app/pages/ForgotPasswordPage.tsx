import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Mail, ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo';

export default function ForgotPasswordPage() {
    const { sendPasswordResetEmail } = useAuth();
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        setIsSubmitting(true);

        try {
            await sendPasswordResetEmail(email);
            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send reset email');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex flex-col">
            <header className="border-b border-green-100 bg-white/80 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link to="/" className="flex items-center gap-2 w-fit">
                        <Logo className="w-8 h-8" />
                        <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            WhatsOrder
                        </span>
                    </Link>
                </div>
            </header>

            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-8">
                        <Link to="/login" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors w-fit">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Sign In
                        </Link>

                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
                        <p className="text-gray-600 mb-8">Enter your email and we'll send you a link to reset your password.</p>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {success ? (
                            <div className="p-6 bg-green-50 border border-green-200 text-green-700 rounded-lg text-center">
                                <Mail className="w-12 h-12 text-green-600 mx-auto mb-4" />
                                <h3 className="font-bold text-lg mb-2">Check your email</h3>
                                <p className="text-sm">We've sent a password reset link to your email address.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            required
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            placeholder="owner@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
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
                                    ) : 'Send Reset Link'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
