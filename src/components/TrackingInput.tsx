
import React, { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

const TrackingInput = () => {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code) return;

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast.info(`Rastreando código: ${code}`, {
                description: "Integração em breve."
            });
        }, 1500);
    };

    return (
        <section className="py-12 bg-zinc-950 border-t border-white/5">
            <div className="container mx-auto px-4 max-w-xl text-center">
                <h3 className="font-heading text-2xl text-white mb-4 uppercase">Rastreie seu pedido</h3>
                <form onSubmit={handleTrack} className="relative flex items-center">
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Ex: AA123456789BR"
                        className="w-full rounded-lg border border-white/10 bg-zinc-900 px-4 py-3 pr-12 text-white placeholder:text-zinc-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary uppercase"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="absolute right-2 p-2 text-primary hover:text-white transition-colors"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                    </button>
                </form>
            </div>
        </section>
    );
};

export default TrackingInput;
