"use client";

import { useWalletStore } from "@/lib/store";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, QrCode, X, Check, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/axios";
import { cn } from "@/lib/utils";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useRouter } from "next/navigation";

export default function SendPage() {
  const router = useRouter();
  const { user, fetchBalance } = useWalletStore();
  const [invoice, setInvoice] = useState("");
  const [manualAmount, setManualAmount] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);

  const handleSend = async (bolt11?: string) => {
    const invoiceToPay = (bolt11 || invoice).trim();
    if (!user?.id || !invoiceToPay) return;

    // Bolt11 Basic Validation (Mainnet, Testnet, Signet, Regtest)
    if (!invoiceToPay.match(/^(lightning:)?(lnbc|lntb|lnbs|lnbcrt)/i)) {
        setError("La factura no parece ser una factura Bolt11 válida (debe empezar con lnbc o lntb)");
        return;
    }

    setIsLoading(true);
    setError("");

    console.log("🚀 Iniciando pago...");
    console.log("📋 Invoice a pagar:", invoiceToPay.substring(0, 20) + "...");
    
    try {
      const amountVal = manualAmount ? parseInt(manualAmount.replace(/[^0-9]/g, ''), 10) : undefined;

      const res = await api.post('/pay', {
        userId: user.id,
        invoice: invoiceToPay.trim(),
        fiatAmount: amountVal,
        fiatCurrency: amountVal ? 'COP' : undefined
      });
      
      setSuccess(true);
      await fetchBalance(); // Refresh balance after payment
      
      // Auto redirect after success
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);

    } catch (e: any) {
      console.error("Error al pagar", e);
      const serverMessage = e.response?.data?.message;
      setError(serverMessage || "Error al procesar el pago. Por favor intenta de nuevo.");
    } finally {
      setIsLoading(false);
      setIsScanning(false);
    }
  };

  const handleScan = (result: any) => {
    if (result && result[0]?.rawValue) {
      const scannedValue = result[0].rawValue;
      // Basic check if it looks like a lightning invoice
      if (scannedValue.toLowerCase().startsWith("lnbc")) {
         setInvoice(scannedValue);
         setIsScanning(false);
      } else {
         setError("Código QR no válido para Lightning");
      }
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 animate-in zoom-in duration-500">
           <Check className="w-12 h-12 stroke-[3]" />
        </div>
        <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tight">¡Pago Enviado!</h2>
            <p className="text-slate-400 font-medium whitespace-pre-line">Tu transacción se ha procesado con éxito.{"\n"}Volviendo al dashboard...</p>
        </div>
        <Button onClick={() => router.push('/dashboard')} className="mt-8 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl px-8 h-12">
            Volver Ahora
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col text-white font-sans selection:bg-primary/30">
      
      {/* Header */}
      <div className="p-4 flex items-center justify-between z-20">
        <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-full transition-all active:scale-95">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-lg font-semibold tracking-wide">Enviar Pago</h1>
        <div className="w-10" /> 
      </div>

      <div className="flex-1 flex flex-col items-center justify-start pt-4 pb-8 px-6 space-y-8 relative">
        
        {/* Scanner Container */}
        <div className="w-full max-w-sm aspect-square relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-[2.5rem] blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          
          <div className="relative aspect-square bg-slate-900 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl flex flex-col items-center justify-center">
            {isScanning ? (
              <div className="absolute inset-0 z-10 scale-110">
                <Scanner 
                  onScan={handleScan}
                  allowMultiple={false}
                  scanDelay={300}
                />
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsScanning(false)}
                    className="absolute top-4 right-4 z-20 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/80"
                >
                    <X className="w-5 h-5" />
                </Button>
                <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-primary/50 shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] animate-bounce" />
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4 p-8 text-center">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-slate-500 mb-2">
                    <QrCode className="w-10 h-10" />
                </div>
                <div>
                    <h3 className="font-bold text-lg">Escanear Código QR</h3>
                    <p className="text-slate-500 text-sm">Escanea una factura Lightning para pagar</p>
                </div>
                <Button 
                    onClick={() => setIsScanning(true)}
                    className="bg-primary text-primary-foreground font-bold rounded-2xl px-8 h-12 shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
                >
                    Abrir Cámara
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Form Area */}
        <div className="w-full max-w-sm space-y-6">
            <div className="relative">
                <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full" />
                <div className="relative bg-card rounded-3xl p-6 border border-white/10 shadow-xl space-y-4">
                    <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-widest text-slate-500 font-bold ml-1">Monto Estimado (Opcional COP)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                            <Input 
                                type="text"
                                inputMode="numeric"
                                value={manualAmount}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                    setManualAmount(val ? parseInt(val).toLocaleString('es-CO') : "");
                                }}
                                placeholder="0"
                                className="bg-black/20 border border-white/5 rounded-2xl pl-8 h-12 text-sm focus:border-primary/50 transition-all font-mono"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] uppercase tracking-widest text-slate-500 font-bold ml-1">Factura Lightning (Bolt11)</label>
                        <div className="relative">
                            <textarea 
                                value={invoice}
                                onChange={(e) => {
                                    const val = e.target.value.trim();
                                    setInvoice(val);
                                    setError("");
                                }}
                                placeholder="lnbc1..."
                                className="w-full h-32 bg-black/20 border border-white/5 rounded-2xl p-4 text-xs font-mono text-slate-300 placeholder:text-slate-700 focus:outline-none focus:border-primary/50 transition-all resize-none"
                            />
                            {invoice && (
                                <button 
                                    onClick={() => setInvoice("")}
                                    className="absolute top-2 right-2 p-1 bg-white/5 hover:bg-white/10 rounded-lg text-slate-500 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-xl border border-red-400/20 text-xs animate-in slide-in-from-top-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <p className="font-medium">{error}</p>
                        </div>
                    )}

                    {/* Improved Enable Logic: Only disable if empty or loading */}
                    <Button 
                        disabled={isLoading || !invoice.trim()}
                        onClick={() => handleSend()}
                        className="w-full h-14 rounded-2xl text-lg font-bold bg-white text-black hover:bg-white/90 disabled:opacity-30 transition-all active:scale-95 shadow-xl"
                    >
                        {isLoading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                <Send className="w-5 h-5 mr-2" />
                                Confirmar Pago
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
