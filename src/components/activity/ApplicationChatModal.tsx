import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ApplicationChat } from "@/components/activity/ApplicationChat";

interface ApplicationChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    application: any;
    currentUserRole?: "seeker" | "provider";
    onWithdraw?: (reason: string) => Promise<void>;
    onReject?: (reason: string) => Promise<void>;
    onSendMessage: (applicationId: string, message: string) => Promise<any>;
    onClosed?: () => void;
}

export function ApplicationChatModal({ isOpen, onClose, onClosed, application, currentUserRole = "seeker", onWithdraw, onReject, onSendMessage }: ApplicationChatModalProps) {
    if (!application) return null;

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
                            <Dialog.Panel className="w-full max-w-5xl h-[85vh] transform rounded-3xl transition-all">
                                <ApplicationChat
                                    application={application}
                                    currentUserRole={currentUserRole}
                                    onWithdraw={onWithdraw}
                                    onReject={onReject}
                                    onSendMessage={onSendMessage}
                                    onClose={onClose}
                                />
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
