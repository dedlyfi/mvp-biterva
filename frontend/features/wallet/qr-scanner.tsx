"use client";

import { Scanner } from "@yudiel/react-qr-scanner";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="relative flex-1 flex flex-col justify-center items-center">
         <div className="absolute top-4 right-4 z-10">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={onClose}>
                <X className="h-8 w-8" />
            </Button>
         </div>
         <div className="w-full max-w-md aspect-square overflow-hidden rounded-lg border-2 border-primary/50 mx-4">
            <Scanner 
                onScan={(result) => {
                    if (result && result.length > 0) {
                        onScan(result[0].rawValue);
                    }
                }}
                onError={(error: any) => console.log(error?.message || error)}

                styles={{
                    container: { width: "100%", height: "100%" },
                    video: { objectFit: "cover" }
                }}
            />
         </div>
         <p className="mt-8 text-white text-center px-4">
            Scan a generic Lightning Invoice or Bitcoin Address
         </p>
      </div>
    </div>
  );
}
