"use client";

import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";

type NotificationPayload = {
    title?: string;
    body?: string;
    message?: string;
};

type NotificationItem = {
    id: string;
    type: string;
    title: string | null;
    body: string | null;
    created_at: string;
    read_at: string | null;
};

function parseNotificationPayload(payload: unknown): NotificationPayload {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return {};
    return payload as NotificationPayload;
}

export function NotificationsPopover() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            const supabase = supabaseBrowser;
            const { count } = await supabase
                .from("notifications")
                .select("*", { count: "exact", head: true })
                .is("read_at", null);
            setUnreadCount(count || 0);

            const { data } = await supabase
                .from("notifications")
                .select("id, type, data, created_at, read_at")
                .order("created_at", { ascending: false })
                .limit(5);
            const mapped = (data ?? []).map((notification) => {
                const payload = parseNotificationPayload(notification.data);
                const title = payload.title?.trim() ? payload.title : "Benachrichtigung";
                const body = payload.body?.trim() || payload.message?.trim() || notification.type;
                return {
                    id: notification.id,
                    type: notification.type,
                    title,
                    body,
                    created_at: notification.created_at || "",
                    read_at: notification.read_at || "",
                } satisfies NotificationItem;
            });
            setNotifications(mapped);
        };
        fetchNotifications();
    }, []);

    const markAsRead = async (id: string) => {
        const supabase = supabaseBrowser;
        await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
        setNotifications((prev) => prev.map((notification) => (
            notification.id === id
                ? { ...notification, read_at: new Date().toISOString() }
                : notification
        )));
        setUnreadCount((prev) => Math.max(0, prev - 1));
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                aria-label={open ? "Benachrichtigungen schließen" : "Benachrichtigungen öffnen"}
                className={cn(
                    "relative flex h-[52px] w-[52px] items-center justify-center rounded-full border text-slate-300",
                    "border-white/10 bg-slate-900/40 shadow-xl backdrop-blur-md",
                    "transition-all duration-200 hover:border-white/20 hover:bg-slate-900/50 hover:text-white"
                )}
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border border-slate-950 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.55)]" />
                )}
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className={cn(
                        "z-50 rounded-2xl border border-white/10 bg-slate-950/90 p-4 shadow-2xl shadow-black/50 backdrop-blur-2xl",
                        "fixed left-4 right-4 top-[72px] md:absolute md:left-auto md:right-0 md:top-[calc(100%+0.5rem)] md:w-[22rem]"
                    )}>
                        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-2">
                            <h4 className="font-semibold text-white">Benachrichtigungen</h4>
                            <span className="text-xs text-slate-400">{unreadCount} neu</span>
                        </div>

                        <div className="max-h-[300px] space-y-2 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="py-8 text-center text-sm text-slate-500">
                                    Keine Benachrichtigungen.
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <button
                                        key={notification.id}
                                        type="button"
                                        onClick={() => !notification.read_at && markAsRead(notification.id)}
                                        className={cn(
                                            "w-full cursor-pointer rounded-xl border p-3 text-left transition-all",
                                            notification.read_at
                                                ? "border-transparent bg-slate-950/40 opacity-70"
                                                : "border-white/10 bg-slate-900/70 hover:border-indigo-400/35 hover:bg-slate-900/90"
                                        )}
                                    >
                                        <p className="text-sm font-medium text-slate-100">{notification.title || "Benachrichtigung"}</p>
                                        <p className="mt-1 line-clamp-2 text-xs text-slate-400">{notification.body || "Kein Inhalt."}</p>
                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="text-[10px] text-slate-500">
                                                {new Date(notification.created_at).toLocaleDateString("de-DE")}
                                            </span>
                                            {!notification.read_at && <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>

                        <div className="mt-4 border-t border-white/10 pt-2 text-center">
                            <Link href="/notifications" className="text-xs font-medium text-indigo-300 hover:text-indigo-200">
                                Alle anzeigen
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
