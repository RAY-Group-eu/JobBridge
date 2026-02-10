"use client";

import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, Send, MessageSquare, AlertCircle, Trash2, CheckCircle2 } from "lucide-react";
import { ButtonPrimary } from "@/components/ui/ButtonPrimary";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/types/supabase";

type ApplicationStatus = Database["public"]["Enums"]["application_status"];

interface ApplicationDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    application: any; // Using any for simplicity as it involves a complex join
    onWithdraw: (reason: string) => Promise<void>;
    onSendMessage: (message: string) => Promise<void>;
}

export function ApplicationDetailModal({ isOpen, onClose, application, onWithdraw, onSendMessage }: ApplicationDetailModalProps) {
    const [message, setMessage] = useState("");
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [withdrawReason, setWithdrawReason] = useState("");
    const [sending, setSending] = useState(false);

    // Mock messages for now (since we haven't implemented message fetching fully yet)
    // In a real implementation, we would fetch messages via a prop or SWR.
    const [messages, setMessages] = useState<{ id: string, content: string, sender: 'me' | 'them', time: string }[]>([]);

    useEffect(() => {
        if (isOpen && application && application.message) {
            // Add initial message from application
            setMessages([{ id: 'init', content: application.message, sender: 'me', time: new Date(application.created_at).toLocaleTimeString() }]);
        }
    }, [isOpen, application]);

    const handleSend = async () => {
        if (!message.trim()) return;
        setSending(true);
        try {
            await onSendMessage(message);
            setMessages(prev => [...prev, { id: Date.now().toString(), content: message, sender: 'me', time: new Date().toLocaleTimeString() }]);
            setMessage("");
        } catch (e) {
            console.error("Failed to send", e);
        } finally {
            setSending(false);
        }
    };

    const handleWithdraw = async () => {
        if (!withdrawReason.trim()) return;
        try {
            await onWithdraw(withdrawReason);
            onClose();
        } catch (e) {
            console.error("Failed to withdraw", e);
        }
    };

    if (!application) return null;

    const status = application.status as ApplicationStatus;
    const isActive = ['submitted', 'negotiating', 'accepted'].includes(status);
    const isChatActive = status === 'negotiating' || status === 'accepted';

    return (
        <Transition appear show={isOpen} as={Fragment}>
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
                            <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-3xl bg-[#09090b] border border-white/10 shadow-2xl transition-all flex flex-col md:flex-row h-[80vh]">

                                {/* Left Side: Details */}
                                <div className="w-full md:w-1/3 bg-[#111116] border-b md:border-b-0 md:border-r border-white/5 flex flex-col">
                                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                        <h3 className="font-bold text-white text-lg truncate pr-4">{application.job?.title}</h3>
                                        <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div className="p-6 space-y-6 overflow-y-auto flex-1">
                                        <div>
                                            <label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1 block">Status</label>
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 capitalize font-medium">
                                                {status}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1 block">Anbieter</label>
                                            <p className="text-white">{application.job?.creator?.company_name || application.job?.creator?.full_name || "Unbekannt"}</p>
                                        </div>

                                        <div>
                                            <label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1 block">Ort</label>
                                            <p className="text-slate-300">{application.job?.public_location_label}</p>
                                        </div>

                                        <div>
                                            <label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1 block">Lohn</label>
                                            <p className="text-white">{application.job?.wage_hourly} € / Std.</p>
                                        </div>

                                        {isActive && !isWithdrawing && (
                                            <button
                                                onClick={() => setIsWithdrawing(true)}
                                                className="w-full py-2 px-4 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 text-sm font-medium transition-colors flex items-center justify-center gap-2 mt-8"
                                            >
                                                <Trash2 size={16} /> Bewerbung zurückziehen
                                            </button>
                                        )}

                                        {isWithdrawing && (
                                            <div className="bg-red-500/5 rounded-xl p-4 border border-red-500/10 space-y-3 animation-in fade-in slide-in-from-top-2">
                                                <h4 className="text-sm font-bold text-red-400 flex items-center gap-2">
                                                    <AlertCircle size={14} /> Wirklich zurückziehen?
                                                </h4>
                                                <p className="text-xs text-slate-400">Dies kann nicht rückgängig gemacht werden.</p>
                                                <textarea
                                                    className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-red-500/50"
                                                    placeholder="Grund (optional)..."
                                                    value={withdrawReason}
                                                    onChange={e => setWithdrawReason(e.target.value)}
                                                />
                                                <div className="flex gap-2">
                                                    <button onClick={() => setIsWithdrawing(false)} className="flex-1 py-1.5 text-xs text-slate-400 hover:text-white">Abbrechen</button>
                                                    <button onClick={handleWithdraw} className="flex-1 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-500">Bestätigen</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Side: Chat */}
                                <div className="flex-1 flex flex-col bg-[#09090b] relative">
                                    <div className="hidden md:flex absolute top-4 right-4 z-10">
                                        <button onClick={onClose} className="rounded-full bg-white/5 p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                                            <X size={20} />
                                        </button>
                                    </div>

                                    {isChatActive ? (
                                        <>
                                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                                <div className="flex justify-center mb-6">
                                                    <div className="bg-indigo-500/10 text-indigo-400 px-4 py-2 rounded-full text-xs font-medium border border-indigo-500/20">
                                                        Chat gestartet. Vereinbare Details direkt hier.
                                                    </div>
                                                </div>
                                                {messages.map(msg => (
                                                    <div key={msg.id} className={cn("flex", msg.sender === 'me' ? "justify-end" : "justify-start")}>
                                                        <div className={cn(
                                                            "max-w-[75%] rounded-2xl px-4 py-3 text-sm",
                                                            msg.sender === 'me'
                                                                ? "bg-indigo-600 text-white rounded-br-none"
                                                                : "bg-[#1c1c21] text-slate-200 border border-white/10 rounded-bl-none"
                                                        )}>
                                                            <p>{msg.content}</p>
                                                            <span className="text-[10px] opacity-50 mt-1 block text-right">{msg.time}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="p-4 border-t border-white/10 bg-[#111116]">
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={message}
                                                        onChange={e => setMessage(e.target.value)}
                                                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                                                        placeholder="Nachricht schreiben..."
                                                        className="flex-1 bg-[#1c1c21] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                                                    />
                                                    <ButtonPrimary onClick={handleSend} disabled={sending || !message.trim()} className="px-4">
                                                        <Send size={18} />
                                                    </ButtonPrimary>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500">
                                            <MessageSquare size={48} className="mb-4 opacity-20" />
                                            <h3 className="text-lg font-medium text-white mb-2">Noch kein Chat</h3>
                                            <p className="max-w-xs mx-auto text-sm">
                                                Der Chat wird aktiviert, sobald der Anbieter auf deine Bewerbung antwortet oder dich akzeptiert.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
