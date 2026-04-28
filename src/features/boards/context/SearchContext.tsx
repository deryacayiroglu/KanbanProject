"use client";
import { createContext, useContext, useState, ReactNode } from "react";

const SearchContext = createContext<{
  searchQuery: string;
  setSearchQuery: (val: string) => void;
}>({
  searchQuery: "",
  setSearchQuery: () => {},
});

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  return useContext(SearchContext);
}
