import { Flag } from "lucide-react";

export default function ModerationPage() {
    return (
        <div className="max-w-4xl mx-auto text-center py-20">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Flag size={32} className="text-slate-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Moderation Queue</h1>
            <p className="text-slate-400">Review user reports and flagged content here.</p>
            <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl inline-block text-yellow-400 text-sm">
                Coming Soon
            </div>
        </div>
    );
}
