import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle, Smartphone, Globe } from 'lucide-react';
import Logo from '../components/Logo';

export default function OnboardingPage() {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        localStorage.setItem('whatsorder_intro_seen', 'true');
        navigate('/dashboard');
    };

    const steps = [
        {
            icon: <CheckCircle className="w-6 h-6 text-green-600" />,
            title: "Create Your Store",
            desc: "Set up your business name and products in seconds."
        },
        {
            icon: <Globe className="w-6 h-6 text-blue-600" />,
            title: "Share Your Link",
            desc: "Send your unique store link to customers anywhere."
        },
        {
            icon: <Smartphone className="w-6 h-6 text-emerald-600" />,
            title: "Get Orders on WhatsApp",
            desc: "Receive perfectly formatted orders directly in your chat."
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 relative overflow-hidden">

                {/* Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -mr-10 -mt-10 z-0"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-50 rounded-tr-full -ml-8 -mb-8 z-0"></div>

                <div className="relative z-10">
                    <div className="flex justify-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-lg shadow-green-500/30 transform -rotate-6">
                            <Logo className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Welcome to <span className="text-green-600">WhatsOrder</span></h1>
                        <p className="text-gray-500 font-medium">The simplest way to sell online and get orders on WhatsApp.</p>
                    </div>

                    <div className="space-y-6 mb-10">
                        {steps.map((step, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 group hover:border-green-200 transition-colors">
                                <div className="bg-white p-3 rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                                    {step.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">{step.title}</h3>
                                    <p className="text-xs text-gray-500 leading-relaxed font-medium">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleGetStarted}
                        className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-gray-900 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10 group"
                    >
                        Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
}
