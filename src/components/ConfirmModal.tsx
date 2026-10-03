import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl text-slate-900 border border-slate-100">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-xl shrink-0 ${isDestructive ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-900'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
        </div>

        <p className="text-sm text-slate-600 mb-5 leading-relaxed">{message}</p>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 rounded-xl font-semibold text-sm transition"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`w-full py-2.5 px-3 rounded-xl font-semibold text-sm text-white transition ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700 active:bg-red-800'
                : 'bg-blue-950 hover:bg-blue-900'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
