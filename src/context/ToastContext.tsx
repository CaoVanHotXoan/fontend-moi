import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Tự động xóa thông báo sau 3.5 giây
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Container đặt góc trên phải, gần vị trí icon tài khoản (top-20 để dưới header) */}
      <div className="fixed top-20 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => {
          let borderColor = 'border-white/10';
          if (toast.type === 'success') {
            borderColor = 'border-emerald-500/50';
          } else if (toast.type === 'error') {
            borderColor = 'border-red-500/50';
          } else if (toast.type === 'warning') {
            borderColor = 'border-amber-500/50';
          } else {
            borderColor = 'border-blue-500/50';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto min-w-[280px] px-8 py-3 rounded-full shadow-lg backdrop-blur-md bg-black/75 border ${borderColor} text-white font-medium flex items-center justify-center relative animate-slideInRight`}
            >
              <span className="text-[16px] tracking-wide text-center font-bold">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl text-white/50 hover:text-white hover:scale-110 transition-transform focus:outline-none"
              >
                &times;
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
