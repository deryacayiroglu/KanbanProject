"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

export function ToastNotification({ message, duration = 4000 }: { message: string, duration?: number }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => setIsVisible(false), 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-4 py-3 bg-gray-900 text-white rounded-lg shadow-xl transition-all duration-300 ${isFadingOut ? 'opacity-0 translate-y-2' : 'animate-in slide-in-from-bottom-4 fade-in'}`}>
      <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
      <p className="text-sm font-medium">{message}</p>
      <button 
        onClick={() => {
          setIsFadingOut(true);
          setTimeout(() => setIsVisible(false), 300);
        }}
        className="ml-2 text-gray-400 hover:text-white transition-colors focus:outline-none"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
