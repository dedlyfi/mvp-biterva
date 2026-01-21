"use client";

import { useWalletStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import axios from "axios";

export function BalanceDisplay() {
  const { balance, btcPrice, isLoading, fetchBalance } = useWalletStore();

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Balance is in SATs. 1 BTC = 100,000,000 SATs
  // Value = (Balance / 100,000,000) * Price
  const balanceInCop = (balance / 100000000) * (btcPrice || 400000000);

  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-2">
      <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
        Balance Total
      </div>
      <div className="flex items-baseline gap-2 text-5xl font-bold tracking-tighter text-primary">
        {balanceInCop.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
        <span className="text-xl text-muted-foreground font-normal">COP</span>
      </div>
      <div className="text-sm text-muted-foreground flex items-center gap-1">
        <span className="text-amber-400">⚡</span>
        <span className="text-lg text-foreground/80">{balance.toLocaleString()} sats</span>
         <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => fetchBalance()}
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            disabled={isLoading}
        >
            <RefreshCw className={cn("h-3 w-3", isLoading && "animate-spin")} />
        </Button>
      </div>
    </div>
  );
}
