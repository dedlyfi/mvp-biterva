"use client";

import { useWalletStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { WithdrawModal } from "@/features/wallet/withdraw-modal";
import { BalanceDisplay } from "@/features/wallet/balance-display";
import { TransactionList } from "@/features/wallet/transaction-list";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, LogOut, Scan } from "lucide-react";

export default function DashboardPage() {
  const { user, _hasHydrated, logout } = useWalletStore();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Only redirect if hydrated and no user found
    if (_hasHydrated && !user) {
      router.push("/login");
    }
  }, [user, router, _hasHydrated]);

  // Prevent flash of content or redirect before hydration
  if (!_hasHydrated) return null; 
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {user.email[0].toUpperCase()}
            </div>
            <span className="font-medium text-sm">{user.email}</span>
        </div>
        <div className="flex items-center space-x-3">
            <button 
                onClick={() => setIsWithdrawModalOpen(true)}
                className="relative w-9 h-9 rounded-full overflow-hidden hover:scale-105 transition-transform shadow-sm"
                title="Retirar a Nequi"
            >
                <Image src="/images/nequi.png" alt="Nequi" fill className="object-cover" />
            </button>
            <Button variant="ghost" size="icon" onClick={() => {
                logout();
                router.push("/login");
            }}>
              <LogOut className="h-5 w-5 text-muted-foreground" />
            </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-md mx-auto p-4 space-y-8">
        <BalanceDisplay />

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
            <Button 
                variant="outline" 
                className="h-24 flex-col space-y-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5 rounded-3xl"
                onClick={() => router.push('/receive')}
            >
                <ArrowDown className="h-7 w-7 text-primary" />
                <span className="font-semibold">Recibir</span>
            </Button>
            <Button 
                variant="outline" 
                className="h-24 flex-col space-y-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5 rounded-3xl"
                onClick={() => router.push('/send')}
            >
                <ArrowUp className="h-7 w-7 text-orange-500" />
                <span className="font-semibold">Enviar</span>
            </Button>
        </div>

        <TransactionList />
      </main>

      <WithdrawModal 
        isOpen={isWithdrawModalOpen} 
        onClose={() => setIsWithdrawModalOpen(false)} 
      />
    </div>
  );
}
