"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Briefcase, Loader2, Search, User } from "lucide-react";
import { Toast } from "@/components/ui/Toast";

type SearchResult = {
    entity_type: "user" | "job";
    entity_id: string;
    title: string;
    subtitle: string;
    link: string;
};

type SearchResponse = {
    items: SearchResult[];
    error?: string | null;
};

export function AdminGlobalSearch() {
    const rootRef = useRef<HTMLDivElement>(null);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [toastOpen, setToastOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const trimmed = query.trim();
    const hasQuery = trimmed.length > 1;

    useEffect(() => {
        const onOutsideClick = (event: MouseEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        window.addEventListener("mousedown", onOutsideClick);
        return () => window.removeEventListener("mousedown", onOutsideClick);
    }, []);

    useEffect(() => {
        if (!hasQuery) {
            setLoading(false);
            setError(null);
            setResults([]);
            return;
        }

        const controller = new AbortController();
        const timer = setTimeout(async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/admin/search?q=${encodeURIComponent(trimmed)}`, {
                    signal: controller.signal,
                });
                const payload = await response.json() as SearchResponse;
                if (!response.ok) {
                    throw new Error(payload.error || "Search failed.");
                }
                setResults(payload.items || []);
            } catch (fetchError: unknown) {
                if ((fetchError as Error).name === "AbortError") return;
                setResults([]);
                const message = fetchError instanceof Error ? fetchError.message : "Search failed.";
                setError(message);
                setToastMessage(message);
                setToastOpen(true);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => {
            controller.abort();
            clearTimeout(timer);
        };
    }, [trimmed, hasQuery]);

    const grouped = useMemo(() => {
        const users = results.filter((item) => item.entity_type === "user");
        const jobs = results.filter((item) => item.entity_type === "job");
        return { users, jobs };
    }, [results]);

    return (
        <>
            <div ref={rootRef} className="relative w-full md:w-96">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                        value={query}
                        onChange={(event) => {
                            setQuery(event.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                        placeholder="Search users and jobs..."
                        className="w-full bg-slate-900/80 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                    {loading && (
                        <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />
                    )}
                </div>

                {isOpen && hasQuery && (
                    <div className="absolute mt-2 w-full rounded-xl border border-white/10 bg-slate-950/95 backdrop-blur-xl shadow-xl z-50 overflow-hidden">
                        {error && (
                            <p className="px-3 py-2 text-xs text-rose-300 bg-rose-500/10 border-b border-rose-500/20">{error}</p>
                        )}

                        {!error && !loading && results.length === 0 && (
                            <p className="px-3 py-3 text-xs text-slate-400">No results for &quot;{trimmed}&quot;.</p>
                        )}

                        {!error && (grouped.users.length > 0 || grouped.jobs.length > 0) && (
                            <div className="max-h-96 overflow-y-auto">
                                {grouped.users.length > 0 && (
                                    <div className="border-b border-white/5">
                                        <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider text-slate-500">Users</p>
                                        {grouped.users.map((item) => (
                                            <Link
                                                key={`user-${item.entity_id}`}
                                                href={item.link}
                                                className="px-3 py-2 text-sm hover:bg-white/5 flex items-start gap-2"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <User size={14} className="mt-0.5 text-slate-400" />
                                                <span>
                                                    <span className="block text-slate-100">{item.title}</span>
                                                    <span className="block text-xs text-slate-500">{item.subtitle}</span>
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                                {grouped.jobs.length > 0 && (
                                    <div>
                                        <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider text-slate-500">Jobs</p>
                                        {grouped.jobs.map((item) => (
                                            <Link
                                                key={`job-${item.entity_id}`}
                                                href={item.link}
                                                className="px-3 py-2 text-sm hover:bg-white/5 flex items-start gap-2"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <Briefcase size={14} className="mt-0.5 text-slate-400" />
                                                <span>
                                                    <span className="block text-slate-100">{item.title}</span>
                                                    <span className="block text-xs text-slate-500">{item.subtitle}</span>
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Toast
                open={toastOpen}
                message={toastMessage}
                type="error"
                onClose={() => setToastOpen(false)}
            />
        </>
    );
}
