"use client";
import { AnimatePresence } from "framer-motion";
import Toast from "./Toast";

export default function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-5 right-1/2 translate-x-1/2 z-90 flex flex-col items-center space-y-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
 