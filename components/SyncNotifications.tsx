'use client';

import { useEffect, useState } from 'react';

interface Toast {
  id: number;
  title: string;
  message: string;
  type: 'success' | 'error' | 'partial';
}

export default function SyncNotifications() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleSyncNotification = (event: Event) => {
      const customEvent = event as CustomEvent<{ title: string; message: string; type: string }>;
      const { title, message, type } = customEvent.detail;

      const newToast: Toast = {
        id: Date.now(),
        title,
        message,
        type: type as 'success' | 'error' | 'partial',
      };

      setToasts(prev => [...prev, newToast]);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, 5000);
    };

    window.addEventListener('sync-notification', handleSyncNotification);

    return () => {
      window.removeEventListener('sync-notification', handleSyncNotification);
    };
  }, []);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            p-4 rounded-lg shadow-lg border backdrop-blur-sm
            animate-slide-in-right
            ${toast.type === 'success' ? 'bg-green-900/90 border-green-500/50' : ''}
            ${toast.type === 'partial' ? 'bg-yellow-900/90 border-yellow-500/50' : ''}
            ${toast.type === 'error' ? 'bg-red-900/90 border-red-500/50' : ''}
          `}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className={`
                font-semibold text-sm mb-1
                ${toast.type === 'success' ? 'text-green-100' : ''}
                ${toast.type === 'partial' ? 'text-yellow-100' : ''}
                ${toast.type === 'error' ? 'text-red-100' : ''}
              `}>
                {toast.title}
              </div>
              <div className={`
                text-xs
                ${toast.type === 'success' ? 'text-green-200' : ''}
                ${toast.type === 'partial' ? 'text-yellow-200' : ''}
                ${toast.type === 'error' ? 'text-red-200' : ''}
              `}>
                {toast.message}
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/60 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
