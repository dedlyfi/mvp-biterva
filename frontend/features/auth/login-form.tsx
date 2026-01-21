"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWalletStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const login = useWalletStore((state) => state.login);
  const isLoading = useWalletStore((state) => state.isLoading);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <Card className="w-full max-w-sm border border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 ring-1 ring-primary/50">
          <Wallet className="h-7 w-7 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">¡Hola de nuevo!</CardTitle>
        <CardDescription className="text-muted-foreground">
          Ingresa tu correo para acceder a tu billetera
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Input
              type="email"
              placeholder="nombre@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 bg-background/50 border-input focus-visible:ring-primary"
            />
            <div className="relative">
                <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 bg-background/50 border-input focus-visible:ring-primary pr-10"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full h-12 text-lg font-medium shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]" 
            disabled={isLoading}
          >
            {isLoading ? "Conectando..." : "Continuar"}
          </Button>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            ¿Aún no tienes cuenta?{" "}
            <Link href="/signup" className="text-primary hover:underline font-medium">
              Regístrate aquí
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
