export default function AdminLoading() {
    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
            <div className="space-y-2">
                <div className="h-8 w-72 rounded bg-white/10" />
                <div className="h-4 w-96 rounded bg-white/5" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="h-36 rounded-3xl bg-white/5 border border-white/10" />
                <div className="h-36 rounded-3xl bg-white/5 border border-white/10" />
                <div className="h-36 rounded-3xl bg-white/5 border border-white/10" />
            </div>
            <div className="h-80 rounded-3xl bg-white/5 border border-white/10" />
        </div>
    );
}
