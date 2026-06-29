"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useApp } from "@/app/store";
import { searchPlaces } from "@/app/lib/geocode";
import type { SearchResult, Place } from "@/types";

interface SearchPanelProps {
  placeholder?: string;
  onSelect?: (place: Place) => void;
  autoFocus?: boolean;
}

export default function SearchPanel({
  placeholder = "Search destinations...",
  onSelect,
  autoFocus,
}: SearchPanelProps) {
  const { userLocation, addStop, setView, history } = useApp();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const doSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await searchPlaces(q, userLocation ?? undefined);
        setResults(res);
      } finally {
        setLoading(false);
      }
    },
    [userLocation]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 400);
  };

  const handleSelect = (r: SearchResult) => {
    const place: Place = {
      id: r.id,
      name: r.name,
      address: r.address,
      coords: r.coords,
    };
    if (onSelect) {
      onSelect(place);
    } else {
      addStop(place);
      setView("route");
    }
    setQuery("");
    setResults([]);
    setFocused(false);
  };

  const recentPlaces = history.flatMap((h) => h.stops).slice(0, 4);

  return (
    <div className="relative w-full">
      {/* Input */}
      <div className="flex items-center bg-white rounded-2xl shadow-md px-4 py-3 gap-3 border border-slate-100">
        <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
       onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder={placeholder}
          className="flex-1 outline-none text-sm text-slate-800 placeholder-slate-400 bg-transparent"
        />
        {loading && (
          <svg className="w-4 h-4 text-primary animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        )}
        {query && !loading && (
          <button
            onClick={() => { setQuery(""); setResults([]); }}
            className="text-slate-400 hover:text-slate-600 shrink-0"
          >
            ✕
          </button>
        )}
      </div>

      {/* Dropdown */}
      {focused && (results.length > 0 || (!query && recentPlaces.length > 0)) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden max-h-80 overflow-y-auto no-scrollbar">
          {/* Recent */}
          {!query && recentPlaces.length > 0 && (
            <div>
              <div className="px-4 pt-3 pb-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Recent
              </div>
              {recentPlaces.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelect(p)}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 text-left"
                >
                  <span className="mt-0.5 text-slate-400 shrink-0">🕐</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{p.name}</p>
                    <p className="text-xs text-slate-400 truncate">{p.address}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Search results */}
          {results.length > 0 && (
            <div>
              {!query ? null : (
                <div className="px-4 pt-3 pb-1 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Results
                </div>
              )}
              {results.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleSelect(r)}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-50 text-left border-t border-slate-50"
                >
                  <span className="mt-0.5 text-slate-400 shrink-0">📍</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{r.name}</p>
                    <p className="text-xs text-slate-400 truncate">{r.address}</p>
                    {r.category && (
                      <span className="inline-block mt-0.5 text-xs bg-slate-100 text-slate-500 rounded px-1.5 py-0.5 capitalize">
                        {r.category}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}