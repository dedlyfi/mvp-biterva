"use client";

import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, X } from "lucide-react";
import { useState } from "react";

interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReceiveModal({ isOpen, onClose }: ReceiveModalProps) {
  // Mock invoice for now
  const mockInvoice = "lnbc100n1p3...";
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(mockInvoice);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-sm relative bg-background">
        <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-2" 
            onClick={onClose}
        >
            <X className="h-4 w-4" />
        </Button>
        <CardHeader className="text-center pb-2">
          <CardTitle>Receive Satoshi</CardTitle>
          <CardDescription>Scan to pay invoice</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-white rounded-lg shadow-inner">
            <QRCode value={mockInvoice} size={200} />
          </div>
          <div className="w-full flex items-center space-x-2">
            <code className="flex-1 text-xs bg-muted p-2 rounded truncate">
                {mockInvoice}
            </code>
            <Button size="icon" variant="outline" onClick={handleCopy}>
                <Copy className="h-4 w-4" />
            </Button>
          </div>
          {copied && <p className="text-xs text-primary font-medium">Copied to clipboard!</p>}
        </CardContent>
      </Card>
    </div>
  );
}
