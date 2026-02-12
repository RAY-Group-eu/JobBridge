import { GuardianConsentModal } from "@/components/GuardianConsentModal";

interface VerificationRequiredModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function VerificationRequiredModal({ isOpen, onClose }: VerificationRequiredModalProps) {
    if (!isOpen) return null;

    return (
        <GuardianConsentModal
            isOpen={isOpen}
            onClose={onClose}
            variant="initial"
        />
    );
}


