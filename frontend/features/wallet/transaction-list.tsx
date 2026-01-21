"use client";

import { useWalletStore } from "@/lib/store";
import { ArrowDownLeft, ArrowUpRight, Clock } from "lucide-react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function TransactionList() {
  const { transactions, btcPrice } = useWalletStore();
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Clock className="mb-4 h-12 w-12 opacity-20" />
        <p>Aún no hay movimientos</p>
      </div>
    );
  }

  const getCopValue = (tx: any) => {
    // IMPORTANTE: Priorizamos el monto fiat guardado para evitar los errores de redondeo (soluciona el problema de los $20.002)
    if (tx.fiatAmount) {
        return tx.fiatAmount;
    }
    // Fallback para transacciones legacy que no tienen fiatAmount
    if (!btcPrice || btcPrice === 0) return 0;
    return (tx.amount / 100000000) * btcPrice;
  };

  // Filtramos las transacciones expiradas para no ensuciar la lista principal
  const activeTransactions = transactions.filter(tx => tx.status !== 'expired');

  if (activeTransactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Clock className="mb-4 h-12 w-12 opacity-20" />
        <p>Aún no hay movimientos</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold px-4 text-slate-400 text-xs uppercase tracking-widest">Actividad Reciente</h3>
      <div className="space-y-1">
        {activeTransactions.map((tx) => (
          <div
            key={tx.id}
            onClick={() => setSelectedTx(tx)}
            className={cn(
                "flex items-center justify-between p-4 px-6 transition-all active:bg-white/5 cursor-pointer hover:bg-white/5 border-b border-white/5 last:border-0",
                tx.status === 'pending' && "opacity-60"
            )}
          >
            <div className="flex items-center space-x-4">
              <div
                className={cn(
                    "p-2.5 rounded-2xl",
                    tx.status === 'pending' ? "bg-slate-500/10 text-slate-500" :
                    tx.type === "incoming" ? "bg-emerald-500/10 text-emerald-500" : "bg-orange-500/10 text-orange-500"
                )}
              >
                {tx.status === 'pending' ? (
                  <Clock className="h-5 w-5 animate-pulse" />
                ) : tx.type === "incoming" ? (
                  <ArrowDownLeft className="h-5 w-5" />
                ) : (
                  <ArrowUpRight className="h-5 w-5" />
                )}
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-sm flex items-center gap-2">
                  {tx.type === "incoming" ? "Recibido" : "Enviado"}
                  {tx.status === 'pending' && (
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase tracking-wider font-extrabold border border-white/5">Pendiente</span>
                  )}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                    {new Date(tx.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} • {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                </p>
              </div>
            </div>
            <div className="text-right space-y-0.5">
              <div
                className={cn(
                    "font-bold text-base",
                    tx.status === 'pending' ? "text-slate-500" :
                    tx.type === "incoming" ? "text-emerald-500" : "text-white"
                )}
              >
                {tx.type === "incoming" ? "+" : "-"} {getCopValue(tx).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {tx.amount.toLocaleString()} sats
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Transaction Detail Modal */}
      {selectedTx && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedTx(null)} />
              <div className="relative w-full max-w-md bg-slate-950 rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-2xl p-6 space-y-6 animate-in slide-in-from-bottom duration-300">
                  <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold">Detalle del Movimiento</h2>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedTx(null)} className="rounded-full hover:bg-white/10">
                          <X className="w-5 h-5" />
                      </Button>
                  </div>

                  <div className="flex flex-col items-center py-6 space-y-3 bg-white/5 rounded-3xl border border-white/5">
                      <div className={cn(
                          "p-4 rounded-full mb-1",
                          selectedTx.status === 'pending' ? "bg-slate-500/20 text-slate-500" :
                          selectedTx.type === "incoming" ? "bg-emerald-500/20 text-emerald-500" : "bg-orange-500/20 text-orange-500"
                      )}>
                          {selectedTx.status === 'pending' ? <Clock className="w-8 h-8 animate-pulse" /> : 
                           selectedTx.type === "incoming" ? <ArrowDownLeft className="w-8 h-8" /> : <ArrowUpRight className="w-8 h-8" />}
                      </div>
                      <p className="text-4xl font-extrabold tracking-tight">
                        {getCopValue(selectedTx).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-slate-400 font-medium flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full text-sm">
                          <span className="text-amber-400">⚡</span>
                          {selectedTx.amount.toLocaleString()} satoshis
                      </p>
                  </div>

                  <div className="space-y-4 py-2">
                      <div className="flex justify-between items-center">
                          <span className="text-slate-500 text-sm font-medium">Estado</span>
                          <span className={cn(
                              "font-bold uppercase text-[10px] tracking-widest px-3 py-1 rounded-full border",
                              selectedTx.status === 'completed' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                              selectedTx.status === 'pending' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                              "bg-red-500/10 text-red-500 border-red-500/20"
                          )}>
                              {selectedTx.status === 'completed' ? 'Completado' : 
                               selectedTx.status === 'pending' ? 'Pendiente' : 
                               selectedTx.status === 'failed' ? 'Fallido' : 'Expirado'}
                          </span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-slate-500 text-sm font-medium">Concepto</span>
                          <span className="font-semibold text-sm">{selectedTx.description || 'Sin concepto'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-slate-500 text-sm font-medium">Fecha</span>
                          <span className="font-semibold text-sm">
                              {new Date(selectedTx.date).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}
                          </span>
                      </div>
                      <div className="flex flex-col gap-2 pt-4 border-t border-white/5">
                          <span className="text-slate-500 text-[11px] uppercase tracking-wider font-bold">ID de Transacción</span>
                          <span className="font-mono text-[10px] text-slate-400 break-all bg-black/40 p-3 rounded-xl border border-white/5">
                              {selectedTx.id}
                          </span>
                      </div>
                  </div>

                  <Button className="w-full h-14 rounded-2xl mt-4 font-bold text-base bg-white text-black hover:bg-slate-200 transition-colors" onClick={() => setSelectedTx(null)}>
                      Cerrar
                  </Button>
              </div>
          </div>
      )}
    </div>
  );
}

// Helper to use cn in this file if not imported
function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}
