import { Link } from 'react-router-dom';
import { Share2, Zap } from 'lucide-react';
import Logo from '../components/Logo';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}
      <header className="border-b border-green-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo className="w-10 h-10" />
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              WhatsOrder
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-lg shadow-green-600/30 hover:shadow-xl hover:shadow-green-600/40"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-block mb-6 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
            🎉 Free for the first 50 businesses
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Accept Orders via{' '}
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              WhatsApp
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            One shareable link. No app required. Start receiving orders from your customers on WhatsApp in minutes.
          </p>
          <Link
            to="/signup"
            className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-xl shadow-green-600/30 hover:shadow-2xl hover:shadow-green-600/40 hover:scale-105"
          >
            Create Your Free Link
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-green-100 hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mb-6">
              <Logo className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">WhatsApp Ordering</h3>
            <p className="text-gray-600 leading-relaxed">
              Customers click your link, select products, and order directly on WhatsApp. No forms, no complications.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-green-100 hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mb-6">
              <Share2 className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Share Everywhere</h3>
            <p className="text-gray-600 leading-relaxed">
              Post your link on Instagram, Facebook, WhatsApp Status, or print a QR code. One link works everywhere.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-green-100 hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mb-6">
              <Zap className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Setup in Minutes</h3>
            <p className="text-gray-600 leading-relaxed">
              Add your products or services, connect your WhatsApp number, and start receiving orders instantly.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white border-y border-green-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 shadow-lg">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Create Your Menu</h3>
              <p className="text-gray-600">
                Add your products or services with names and prices. Takes less than 5 minutes.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 shadow-lg">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Share Your Link</h3>
              <p className="text-gray-600">
                Get your unique link like whatsorder.app/yourname and share it anywhere.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 shadow-lg">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Receive Orders</h3>
              <p className="text-gray-600">
                Customers order on WhatsApp. You get their order details instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-12 text-center shadow-2xl">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to start receiving orders?
          </h2>
          <p className="text-green-50 text-lg mb-8 max-w-2xl mx-auto">
            Join the first 50 businesses and get WhatsOrder completely free.
          </p>
          <Link
            to="/signup"
            className="inline-block bg-white hover:bg-gray-50 text-green-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105"
          >
            Create Your Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-green-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Logo className="w-6 h-6" />
              <span className="font-bold text-gray-900">WhatsOrder</span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2024 WhatsOrder. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
