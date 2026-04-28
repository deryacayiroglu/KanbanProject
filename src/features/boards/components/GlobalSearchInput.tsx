"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useSearch } from "@/features/boards/context/SearchContext";
import { usePathname } from "next/navigation";

export function GlobalSearchInput() {
  const { searchQuery, setSearchQuery } = useSearch();
  const pathname = usePathname();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isMobileSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMobileSearchOpen]);

  // Only show the search input on the main boards page
  if (pathname !== "/boards") return null;

  return (
    <>
      {/* Desktop Search (always visible) */}
      <div className="relative w-full max-w-md mx-auto hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search boards..."
          className="w-full pl-9 pr-8 py-1.5 bg-gray-100 border border-transparent rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 rounded-md transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Mobile Search Icon Button */}
      {!isMobileSearchOpen && (
        <button
          onClick={() => setIsMobileSearchOpen(true)}
          className="sm:hidden p-2 -mr-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
          title="Search boards"
        >
          <Search className="w-5 h-5" />
        </button>
      )}

      {/* Mobile Expanded Search (Overlay on header) */}
      {isMobileSearchOpen && (
        <div className="absolute inset-0 z-50 bg-white px-4 flex items-center sm:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="relative w-full flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search boards..."
              className="w-full pl-9 pr-10 py-2 bg-gray-100 border border-transparent rounded-lg text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setIsMobileSearchOpen(false);
                }
              }}
            />
            <button
              onClick={() => {
                setIsMobileSearchOpen(false);
                setSearchQuery("");
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
