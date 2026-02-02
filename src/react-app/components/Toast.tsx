import { useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

export interface ToastProps {
  message: string;
  type?: 'error' | 'success' | 'info';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = 'error', onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const styles = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: AlertCircle,
      iconColor: 'text-red-600',
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: CheckCircle,
      iconColor: 'text-green-600',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: Info,
      iconColor: 'text-blue-600',
    },
  };

  const style = styles[type];
  const Icon = style.icon;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md animate-in slide-in-from-top-2">
      <div className={`${style.bg} ${style.border} border rounded-lg shadow-lg p-4 flex items-start gap-3`}>
        <Icon className={`w-5 h-5 ${style.iconColor} flex-shrink-0 mt-0.5`} />
        <p className={`${style.text} flex-1 text-sm font-medium`}>{message}</p>
        <button
          onClick={onClose}
          className={`${style.text} hover:opacity-70 transition-opacity flex-shrink-0`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
