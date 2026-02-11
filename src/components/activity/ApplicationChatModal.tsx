import { Fragment, useState, useEffect, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Send, MessageSquare, AlertCircle, Trash2, CheckCircle2, Clock, Building2, MapPin, Euro, ArrowLeft, XCircle, User } from "lucide-react";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/types/supabase";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { RealtimePostgresInsertPayload } from "@supabase/supabase-js";

interface ApplicationChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    application: any; // Using any for simplicity as it involves a complex join
    currentUserRole?: "seeker" | "provider";
    onWithdraw?: (reason: string) => Promise<void>;
    onReject?: (reason: string) => Promise<void>;
    onSendMessage: (applicationId: string, message: string) => Promise<any>;
    onClosed?: () => void;
}

export function ApplicationChatModal({ isOpen, onClose, onClosed, application, currentUserRole = "seeker", onWithdraw, onReject, onSendMessage }: ApplicationChatModalProps) {
    const [message, setMessage] = useState("");
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [withdrawReason, setWithdrawReason] = useState("");
    const [sending, setSending] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const supabase = supabaseBrowser;
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false);

    // Defer heavy content rendering to unblock initial interaction
    useEffect(() => {
        if (isOpen) {
            const timer = requestAnimationFrame(() => {
                setIsReady(true);
            });
            return () => cancelAnimationFrame(timer);
        } else {
            setIsReady(false);
        }
    }, [isOpen]);

    // Get current user id
    useEffect(() => {
        if (!isReady) return;
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setCurrentUserId(user.id);
        };
        getUser();
    }, [supabase, isReady]);

    // Fetch initial messages
    useEffect(() => {
        if (isOpen && application && isReady) {
            const fetchMessages = async () => {
                const { data } = await supabase
                    .from("messages")
                    .select("*")
                    .eq("application_id", application.id)
                    .order("created_at", { ascending: true });

                if (data) setMessages(data);
            };
            fetchMessages();

            // Realtime subscription
            const channel = supabase
                .channel(`app-chat-${application.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'messages',
                        filter: `application_id=eq.${application.id}`
                    },
                    (payload: RealtimePostgresInsertPayload<Database['public']['Tables']['messages']['Row']>) => {
                        setMessages(prev => [...prev, payload.new]);
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [isOpen, application, supabase, isReady]);

    // Scroll to bottom
    useEffect(() => {
        if (isReady) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen, isReady]);


    const handleSend = async () => {
        if (!message.trim()) return;
        setSending(true);
        try {
            await onSendMessage(application.id, message);
            // Optimistic update handled by Realtime, but input clear here
            setMessage("");
        } catch (e) {
            console.error("Failed to send", e);
        } finally {
            setSending(false);
        }
    };

    const handleAction = async () => {
        if (!withdrawReason.trim()) return;
        try {
            if (currentUserRole === "seeker" && onWithdraw) {
                await onWithdraw(withdrawReason);
            } else if (currentUserRole === "provider" && onReject) {
                await onReject(withdrawReason);
            }
            onClose();
        } catch (e) {
            console.error("Failed to execute action", e);
        }
    };

    if (!application) return null;

    const status = application.status;
    const isActive = ['submitted', 'negotiating', 'accepted'].includes(status);

    // Header Info
    const title = currentUserRole === "seeker"
        ? application.job?.title
        : application.applicant?.full_name || "Unbekannter Bewerber";

    const subtitle = currentUserRole === "seeker"
        ? (application.job?.creator?.company_name || "Privat")
        : `Bewerbung für ${application.job?.title || "Job"}`;

    const icon = currentUserRole === "seeker" ? <Building2 size={14} /> : <User size={14} />;

    return (
        <Transition appear show={isOpen} as={Fragment} afterLeave={onClosed}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95 translate-y-4"
                            enterTo="opacity-100 scale-100 translate-y-0"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100 translate-y-0"
                            leaveTo="opacity-0 scale-95 translate-y-4"
                        >
                            <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-3xl bg-[#09090b] border border-white/10 shadow-2xl transition-all flex flex-col md:flex-row h-[85vh]">
                                {!isReady ? (
                                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                                            <p className="text-sm font-medium">Lade...</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>

                                        {/* Left Side: Job Summary & Actions */}
                                        <div className="hidden md:flex w-1/3 bg-[#111116] border-r border-white/5 flex-col">
                                            <div className="p-6 border-b border-white/5">
                                                <h3 className="text-xl font-bold text-white leading-tight mb-2">{title}</h3>
                                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                                    {icon}
                                                    <span>{subtitle}</span>
                                                </div>
                                            </div>

                                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                                {/* Key Facts (Only for Seeker normally, but can show for Provider too or hide) */}
                                                {currentUserRole === "seeker" && (
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-3 text-sm text-slate-300">
                                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-500">
                                                                <Euro size={16} />
                                                            </div>
                                                            <div>
                                                                <span className="block text-xs text-slate-500 uppercase font-bold">Lohn</span>
                                                                {application.job?.wage_hourly} € / Std.
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-sm text-slate-300">
                                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-500">
                                                                <MapPin size={16} />
                                                            </div>
                                                            <div>
                                                                <span className="block text-xs text-slate-500 uppercase font-bold">Ort</span>
                                                                {application.job?.public_location_label}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {currentUserRole === "provider" && (
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-3 text-sm text-slate-300">
                                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-500">
                                                                <Clock size={16} />
                                                            </div>
                                                            <div>
                                                                <span className="block text-xs text-slate-500 uppercase font-bold">Beworben am</span>
                                                                {new Date(application.created_at).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="h-px bg-white/5" />

                                                {/* Status */}
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase font-bold mb-2">Status</p>
                                                    <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium w-full justify-center",
                                                        status === 'accepted' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                            status === 'negotiating' ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                                                                status === 'rejected' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                                                    "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                                    )}>
                                                        {status === 'accepted' && <CheckCircle2 size={16} />}
                                                        {status === 'negotiating' && <MessageSquare size={16} />}
                                                        {status === 'rejected' && <XCircle size={16} />}
                                                        <span className="capitalize">{status}</span>
                                                    </div>
                                                </div>

                                                {/* Action Button (Withdraw or Reject) */}
                                                {isActive && !isWithdrawing && (
                                                    <div className="pt-8">
                                                        <button
                                                            onClick={() => setIsWithdrawing(true)}
                                                            className="w-full py-3 px-4 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-colors text-sm font-medium flex items-center justify-center gap-2 border border-transparent hover:border-red-500/10"
                                                        >
                                                            {currentUserRole === "seeker" ? (
                                                                <> <Trash2 size={16} /> Bewerbung zurückziehen </>
                                                            ) : (
                                                                <> <XCircle size={16} /> Bewerbung ablehnen </>
                                                            )}
                                                        </button>
                                                    </div>
                                                )}

                                                {isWithdrawing && (
                                                    <div className="bg-red-500/5 rounded-xl p-4 border border-red-500/10 space-y-3 animation-in fade-in slide-in-from-top-2 mt-4">
                                                        <h4 className="text-sm font-bold text-red-400 flex items-center gap-2">
                                                            <AlertCircle size={14} />
                                                            {currentUserRole === "seeker" ? "Wirklich zurückziehen?" : "Bewerber ablehnen?"}
                                                        </h4>
                                                        <p className="text-xs text-slate-400">
                                                            {currentUserRole === "seeker" ? "Dies beendet die Bewerbung." : "Der Bewerber wird benachrichtigt."}
                                                        </p>
                                                        <textarea
                                                            className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-red-500/50 resize-none h-20"
                                                            placeholder={currentUserRole === "seeker" ? "Grund (optional)..." : "Begründung..."}
                                                            value={withdrawReason}
                                                            onChange={e => setWithdrawReason(e.target.value)}
                                                        />
                                                        <div className="flex gap-2">
                                                            <button onClick={() => setIsWithdrawing(false)} className="flex-1 py-2 text-xs text-slate-400 hover:text-white bg-white/5 rounded-lg">Abbrechen</button>
                                                            <button onClick={handleAction} className="flex-1 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-500">Bestätigen</button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right Side: Chat & Content */}
                                        <div className="flex-1 flex flex-col bg-[#09090b] relative h-[85vh] md:h-auto">
                                            {/* Mobile Header */}
                                            <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-[#111116]">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                                                        <ArrowLeft size={20} />
                                                    </button>
                                                    <div>
                                                        <h3 className="font-bold text-white text-sm truncate">{title}</h3>
                                                        <p className="text-xs text-slate-500">{subtitle}</p>
                                                    </div>
                                                </div>
                                                {isActive && (
                                                    <button onClick={() => setIsWithdrawing(!isWithdrawing)} className="text-slate-400 hover:text-red-400">
                                                        {currentUserRole === "seeker" ? <Trash2 size={18} /> : <XCircle size={18} />}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Mobile Withdraw Overlay */}
                                            {isWithdrawing && (
                                                <div className="md:hidden absolute top-14 left-0 right-0 z-20 bg-[#111116] p-4 border-b border-white/5 shadow-xl">
                                                    <div className="bg-red-500/5 rounded-xl p-4 border border-red-500/10 space-y-3">
                                                        <h4 className="text-sm font-bold text-red-400 flex items-center gap-2">
                                                            <AlertCircle size={14} /> {currentUserRole === "seeker" ? "Bewerbung zurückziehen?" : "Bewerber ablehnen?"}
                                                        </h4>
                                                        <textarea
                                                            className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-red-500/50 resize-none h-20"
                                                            placeholder={currentUserRole === "seeker" ? "Grund (optional)..." : "Begründung..."}
                                                            value={withdrawReason}
                                                            onChange={e => setWithdrawReason(e.target.value)}
                                                        />
                                                        <div className="flex gap-2">
                                                            <button onClick={() => setIsWithdrawing(false)} className="flex-1 py-2 text-xs text-slate-400 hover:text-white bg-white/5 rounded-lg">Abbrechen</button>
                                                            <button onClick={handleAction} className="flex-1 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-500">Bestätigen</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Messages Area */}
                                            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-gradient-to-b from-[#09090b] to-[#0c0c10]">

                                                {/* Initial System Message */}
                                                <div className="flex justify-center my-6">
                                                    <div className="bg-white/5 px-4 py-2 rounded-full text-xs text-slate-500 border border-white/5 flex items-center gap-2">
                                                        <Clock size={12} /> Bewerbung gesendet {formatDistanceToNow(new Date(application.created_at), { addSuffix: true, locale: de })}
                                                    </div>
                                                </div>

                                                {/* Application Message */}
                                                {application.message && (
                                                    <div className="flex justify-end">
                                                        <div className="max-w-[85%] md:max-w-[70%]">
                                                            <div className="bg-indigo-600/20 text-indigo-100 rounded-2xl rounded-br-sm px-5 py-3.5 text-sm leading-relaxed border border-indigo-500/20 shadow-sm">
                                                                {application.message}
                                                            </div>
                                                            <span className="text-[10px] text-slate-600 mt-1 block text-right">
                                                                Bewerbungstext
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {messages.map((msg) => {
                                                    const isMe = msg.sender_id === currentUserId;
                                                    return (
                                                        <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                                                            <div className="max-w-[85%] md:max-w-[70%]">
                                                                <div className={cn(
                                                                    "rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm",
                                                                    isMe
                                                                        ? "bg-indigo-600 text-white rounded-br-sm shadow-indigo-500/10"
                                                                        : "bg-[#1c1c21] text-slate-200 border border-white/5 rounded-bl-sm"
                                                                )}>
                                                                    {msg.content}
                                                                </div>
                                                                <span className={cn(
                                                                    "text-[10px] text-slate-600 mt-1 block",
                                                                    isMe ? "text-right" : "text-left"
                                                                )}>
                                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                <div ref={messagesEndRef} />
                                            </div>

                                            {/* Input Area */}
                                            <div className="p-4 md:p-6 bg-[#111116] border-t border-white/5">
                                                <div className="flex gap-3">
                                                    <input
                                                        type="text"
                                                        value={message}
                                                        onChange={e => setMessage(e.target.value)}
                                                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                                                        placeholder="Nachricht schreiben..."
                                                        disabled={sending || !isActive}
                                                        className="flex-1 bg-[#1c1c21] border border-white/10 rounded-xl px-5 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    />
                                                    <ButtonPrimary
                                                        onClick={handleSend}
                                                        disabled={sending || !message.trim() || !isActive}
                                                        className="px-5 rounded-xl aspect-square flex items-center justify-center p-0"
                                                    >
                                                        {sending ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Send size={20} />}
                                                    </ButtonPrimary>
                                                </div>
                                                {!isActive && (
                                                    <p className="text-center text-xs text-slate-500 mt-3">
                                                        Dieser Chat ist geschlossen, da die Bewerbung beendet wurde.
                                                    </p>
                                                )}
                                            </div>

                                            <div className="hidden md:block absolute top-6 right-6 z-10">
                                                <button onClick={onClose} className="rounded-full bg-black/20 hover:bg-white/10 p-2 text-slate-400 hover:text-white transition-colors backdrop-blur-sm border border-white/5">
                                                    <X size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
