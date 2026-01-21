"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWalletStore } from "@/lib/store";

export default function HomePage() {
  const router = useRouter();
  const user = useWalletStore((state) => state.user);

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [user, router]);

  return null; // Or a loading spinner
}
