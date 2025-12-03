import React, { useEffect } from 'react';
import { CheckCircleIcon, SparklesIcon } from './Icon';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  type?: 'success' | 'info';
}

export const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose, type = 'success' }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4">
      <div className="bg-zinc-900 border border-zinc-700 text-white px-6 py-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex items-center gap-4 animate-slide-up backdrop-blur-md">
        <div className={`p-2 rounded-full ${type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
            {type === 'success' ? <CheckCircleIcon className="w-5 h-5" /> : <SparklesIcon className="w-5 h-5" />}
        </div>
        <div>
          <p className="font-black text-sm uppercase tracking-wide">{type === 'success' ? 'Success' : 'Update'}</p>
          <p className="text-xs text-zinc-400 font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
};