import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function Toast() {
  const { toastMessage } = useAuth();

  if (!toastMessage) return null;

  const { message, type } = toastMessage;

  const styles = {
    success: 'bg-slate-900 text-white border-emerald-500',
    error: 'bg-rose-950 text-white border-rose-500',
    info: 'bg-slate-900 text-white border-blue-500'
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-l-4 shadow-xl text-xs font-semibold max-w-md ${styles[type] || styles.success}`}>
        {icons[type] || icons.success}
        <span>{message}</span>
      </div>
    </div>
  );
}
