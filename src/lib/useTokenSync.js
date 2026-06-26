"use client";

import { useEffect, useRef } from "react";
import { authClient } from "@/lib/auth-client";

export function useTokenSync() {
  const { data: session, isPending } = authClient.useSession();
  const synced = useRef(false);

  useEffect(() => {
    if (isPending) return;

    const user = session?.user;

    if (user && !synced.current) {
      synced.current = true;
      fetch("/api/auth/token", { method: "POST" }).catch((err) => {
        console.error("[TokenSync] Failed to sync JWT:", err);
        synced.current = false;
      });
    }
    
    if (!user) {
      synced.current = false;
    }
  }, [session, isPending]);
}
