"use client";

import { useWalletStore } from "@/lib/store";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Share2, Copy, Check } from "lucide-react";
import Link from "next/link";
import QRCode from "react-qr-code";
import { api } from "@/lib/axios";
import { cn, copyToClipboard } from "@/lib/utils";
import axios from "axios";

export default function ReceivePage() {
  const { user, btcPrice, fetchPrice } = useWalletStore();
  const [amountDisplay, setAmountDisplay] = useState<string>("");
  const [amountInt, setAmountInt] = useState<number>(0);
  const [satsAmount, setSatsAmount] = useState<number>(0);
  const [memo, setMemo] = useState<string>("");
  const [invoice, setInvoice] = useState<string>("");
  const [copied, setCopied] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>("");

  // Ensure price is available
  useEffect(() => {
    if (!btcPrice || btcPrice === 0) {
        fetchPrice();
    }
  }, [btcPrice, fetchPrice]);

  // Convert COP to Sats when amountInt or btcPrice changes
  useEffect(() => {
    if (amountInt > 0 && btcPrice > 0) {
      // Usamos un margen de seguridad del 0.5% para cubrir fluctuaciones y redondeos
      // Y redondeamos hacia arriba (ceil) para asegurar que llegue "al menos" lo pedido
      const safePrice = btcPrice * 0.995; 
      const sats = Math.ceil((amountInt / safePrice) * 100000000);
      setSatsAmount(sats);
    } else {
      setSatsAmount(0);
    }
  }, [amountInt, btcPrice]);

  const handleGenerate = async () => {
    if (!user?.id || satsAmount <= 0 || !memo.trim()) return;
    
    setIsGenerating(true);
    setError("");
    setInvoice("");

    try {
        const res = await api.post('/invoice', {
            userId: user?.id,
            amount: satsAmount,
            memo: memo,
            fiatAmount: amountInt,
            fiatCurrency: 'COP'
        });
        setInvoice(res.data.paymentRequest);
    } catch (e) {
        console.error("Error generando factura", e);
        setError("Error al generar la factura. Intenta de nuevo.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!invoice) return;
    const success = await copyToClipboard(invoice);
    if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (!invoice) return;
    
    const shareText = `Biterva Lightning: Págame ${amountDisplay} COP (${satsAmount.toLocaleString()} sats). Concepto: ${memo}`;
    
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Factura Biterva',
                text: shareText,
                url: invoice,
            });
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error('Error sharing:', error);
                handleCopy();
            }
        }
    } else {
        handleCopy();
        alert('Factura copiada al portapapeles: ' + shareText);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    if (!rawValue) {
        setAmountDisplay("");
        setAmountInt(0);
        setInvoice("");
        return;
    }

    const val = parseInt(rawValue, 10);
    setAmountInt(val);
    setAmountDisplay(val.toLocaleString('es-CO').replace(/,/g, '.'));
    // Reset invoice if amount changes to force re-generation
    if (invoice) setInvoice("");
  };

  const isFilled = amountInt > 0 && memo.trim().length > 0;

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col text-white font-sans selection:bg-primary/30">
      
      {/* Header */}
      <div className="p-4 flex items-center justify-between z-10">
        <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-full transition-all active:scale-95">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg font-semibold tracking-wide">Generar Factura Lightning</h1>
        <div className="w-10" /> 
      </div>

      <div className="flex-1 flex flex-col items-center justify-start pt-8 pb-6 px-6 space-y-6 relative overflow-hidden">
        
        {/* QR Code Container */}
        <div 
            className={cn(
                "relative bg-white p-4 rounded-[2rem] shadow-2xl transition-all duration-500 ease-in-out z-0",
                invoice ? "translate-y-0 scale-90" : "translate-y-12 scale-100"
            )}
        >
           {invoice ? (
               <QRCode value={invoice} size={220} className="animate-in fade-in duration-500" />
           ) : (
               <div className="w-[220px] h-[220px] bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-sm font-medium px-4 text-center">
                   {isGenerating ? "Generando..." : "Completa monto y concepto"}
               </div>
           )}
           
           <div 
                className={cn(
                    "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/90 p-2 px-3 rounded-lg border border-primary/50 backdrop-blur-md transition-all duration-500",
                    invoice ? "opacity-0 scale-50 pointer-events-none" : "opacity-100 scale-100"
                )}
           >
               <span className="text-primary font-bold text-sm tracking-wider">Biterva</span>
           </div>
        </div>

        {/* SATs Equivalent Label */}
        {satsAmount > 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-2">
                <p className="text-amber-400 font-bold text-sm flex items-center gap-1">
                    ⚡ {satsAmount.toLocaleString()} sats
                </p>
            </div>
        )}

        {/* Invoice String Display */}
        <div 
            onClick={handleCopy}
            className={cn(
                "w-full max-w-xs transition-opacity duration-300 cursor-pointer active:scale-[0.98]",
                invoice ? "opacity-100" : "opacity-0"
            )}
        >
             <div className="bg-black/40 backdrop-blur-md rounded-xl p-3 border border-white/5 flex items-center gap-3 shadow-inner">
                <p className="flex-1 font-mono text-[10px] text-slate-400 truncate tracking-tight">
                    {invoice || "Esperando datos..."}
                </p>
                {copied ? (
                    <Check className="w-4 h-4 text-green-500 animate-in zoom-in" />
                ) : (
                    <Copy className="w-4 h-4 text-slate-500" />
                )}
            </div>
        </div>

        {/* Input Area */}
        <div className="w-full max-w-xs space-y-4 z-10">
            
            <div className="bg-card w-full p-5 rounded-3xl border border-white/10 shadow-xl backdrop-blur-lg">
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[11px] uppercase tracking-wider text-slate-400 font-bold ml-1">Monto (Pesos COP)</label>
                        <div className="relative">
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xl">$</span>
                            <Input 
                                type="text" 
                                inputMode="numeric"
                                value={amountDisplay} 
                                onChange={handleAmountChange}
                                className="text-3xl font-bold bg-transparent border-0 border-b-2 border-slate-700/50 rounded-none text-center focus-visible:ring-0 focus-visible:border-primary pl-6 pr-0 py-2 h-auto placeholder:text-slate-700 transition-all font-mono"
                                placeholder="0"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[11px] uppercase tracking-wider text-slate-400 font-bold ml-1">Concepto</label>
                         <Input 
                            value={memo} 
                            onChange={(e) => {
                                setMemo(e.target.value);
                                if (invoice) setInvoice("");
                            }}
                            className="bg-transparent border-0 border-b-2 border-slate-700/50 rounded-none px-0 text-center focus-visible:ring-0 focus-visible:border-primary placeholder:text-slate-700 transition-all text-sm h-10"
                            placeholder="¿Por qué te pagan?"
                        />
                    </div>
                </div>
            </div>

            <Button 
                onClick={handleGenerate}
                disabled={!isFilled || isGenerating || invoice.length > 0}
                className={cn(
                    "w-full h-14 rounded-2xl text-lg font-bold transition-all active:scale-95 shadow-lg",
                    invoice ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
            >
                {isGenerating ? "Generando..." : invoice ? "Factura Lista" : "Generar Factura"}
            </Button>

            <div className="grid grid-cols-2 gap-3 pt-2">
                <Button 
                    variant="outline" 
                    className="h-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/50 hover:text-primary transition-all active:scale-95 disabled:opacity-30 disabled:grayscale"
                    onClick={handleCopy}
                    disabled={!invoice}
                >
                    <Copy className="w-5 h-5 mr-2" />
                    Copiar
                </Button>
                <Button 
                    variant="outline" 
                    className="h-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/50 hover:text-primary transition-all active:scale-95 disabled:opacity-30 disabled:grayscale"
                    onClick={handleShare}
                    disabled={!invoice}
                >
                    <Share2 className="w-5 h-5 mr-2" />
                    Compartir
                </Button>
            </div>

            {error && (
                <p className="text-center text-xs text-red-400 animate-in fade-in">{error}</p>
            )}

        </div>
      </div>
    </div>
  );
}
