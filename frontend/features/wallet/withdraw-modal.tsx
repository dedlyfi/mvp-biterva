import { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react"; 
import { useWalletStore } from "@/lib/store";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WithdrawModal = ({ isOpen, onClose }: WithdrawModalProps) => {
  const { user, balance, btcPrice, fetchBalance } = useWalletStore();
  const [amountCop, setAmountCop] = useState<string>("");
  const [nequiNumber, setNequiNumber] = useState("");
  const [observations, setObservations] = useState("");
  const [saveNequi, setSaveNequi] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setAmountCop("");
      setNequiNumber(user?.nequiNumber || "");
      setSaveNequi(!!user?.nequiNumber);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculate Rate: COP per SAT
  // btcPrice is ~ 400,000,000 COP/BTC
  // 1 BTC = 100,000,000 SATS
  // Rate = 400,000,000 / 100,000,000 = 4 COP/SAT
  const copPerSat = btcPrice > 0 ? btcPrice / 100_000_000 : 4; // Fallback to 4 if API fails

  const rawCopValue = parseInt(amountCop.replace(/\D/g, "") || "0", 10);
  const calculatedSats = Math.ceil(rawCopValue / copPerSat);
  const hasInsufficientFunds = calculatedSats > balance;

  // Formatters
  const formatCop = (value: string) => {
    if (!value) return "";
    const number = parseInt(value.replace(/\D/g, "") || "0", 10);
    return new Intl.NumberFormat("es-CO").format(number);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setAmountCop(formatCop(raw));
  };

  const handleNequiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw.length <= 10) {
        setNequiNumber(raw);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (hasInsufficientFunds) return;
    
    setIsLoading(true);
    setError(null);

    try {
      await api.post('/withdraw-nequi', {
        userId: user.id,
        amountSats: calculatedSats,
        // Send simple 10-digit number. Some APIs might need '57' prefix, 
        // but user usually types local number. Let's send raw for now.
        nequi: nequiNumber,
        observations,
        saveNequi
      });
      
      // Refresh balance
      onClose();
    } catch (err: any) {
        console.error("Withdraw error", err);
        setError(err.response?.data?.message || "Error processing withdrawal");
    } finally {
      // Always refresh balance/user data to pick up saved preferences (e.g. Nequi number)
      await fetchBalance();
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      {/* Modal Content */}
      <div className="w-full max-w-sm bg-background border rounded-3xl shadow-xl overflow-hidden relative animate-in fade-in zoom-in duration-200">
         {/* Close Button */}
         <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10">
             <X className="w-6 h-6" />
         </button>

         <div className="p-6 space-y-6">
            <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                    <Image 
                        src="/images/nequi.png" 
                        alt="Nequi" 
                        width={40} 
                        height={40} 
                        className="object-contain" 
                        style={{ width: "auto", height: "auto" }}
                    />
                </div>
                <h2 className="text-xl font-bold">Retirar a Nequi</h2>
                <p className="text-sm text-muted-foreground">Envía tus Satoshis a tu cuenta Nequi *.</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium ml-1">Celular Nequi</label>
                    <Input 
                        type="tel" 
                        inputMode="numeric"
                        placeholder="300 123 4567" 
                        value={nequiNumber}
                        onChange={handleNequiChange}
                        className="h-12 text-lg rounded-xl"
                    />
                    <div className="flex items-center space-x-2 ml-1">
                        <input 
                            type="checkbox" 
                            id="saveNequi" 
                            checked={saveNequi} 
                            onChange={(e) => setSaveNequi(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <label htmlFor="saveNequi" className="text-sm text-muted-foreground select-none cursor-pointer">
                            Guardar para futuros retiros
                        </label>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium ml-1">Monto (COP)</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input 
                            type="text" 
                            inputMode="numeric"
                            placeholder="0" 
                            value={amountCop}
                            onChange={handleAmountChange}
                            className={`h-12 text-lg pl-7 rounded-xl ${hasInsufficientFunds ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        />
                    </div>
                    
                    {/* Helper / Error Text */}
                    <div className="flex justify-between items-start text-xs px-1">
                        <span className="text-muted-foreground">
                           ≈ {calculatedSats.toLocaleString()} sats
                        </span>
                        <div className="text-right">
                             {hasInsufficientFunds ? (
                                <span className="text-red-500 font-medium block">
                                    Saldo insuficiente
                                </span>
                             ) : (
                                <span className="text-emerald-600 block">
                                   Saldo: {balance.toLocaleString()} sats
                                </span>
                             )}
                             <span className="text-[10px] text-muted-foreground">
                                1 sat ≈ ${copPerSat.toFixed(2)} COP
                             </span>
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium ml-1">Observaciones (Opcional)</label>
                    <Input 
                        placeholder="Ej. Nombre del titular" 
                        value={observations}
                        onChange={(e) => setObservations(e.target.value)}
                        className="h-12 text-lg rounded-xl"
                    />
                </div>
            </div>
            
            <p className="text-xs text-muted-foreground text-center bg-yellow-500/10 p-2 rounded-lg border border-yellow-500/20">
                ⚠️ Por el momento, los retiros pueden tardar entre 1 y 2 días hábiles en reflejarse.
            </p>
            
            {error && (
                <div className="p-3 bg-red-500/10 text-red-500 text-sm rounded-xl text-center">
                    {error}
                </div>
            )}

            <Button 
                onClick={handleSubmit} 
                disabled={!rawCopValue || nequiNumber.length < 10 || hasInsufficientFunds || isLoading}
                className="w-full h-12 rounded-xl text-base font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
            >
                {isLoading ? "Procesando..." : "Confirmar Retiro"}
            </Button>
         </div>
      </div>
    </div>
  );
};
