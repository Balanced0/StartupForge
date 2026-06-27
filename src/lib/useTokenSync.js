"use client";

import { useEffect, useRef } from "react";
import { authClient } from "@/lib/auth-client";

const EXPRESS_URL = process.env.NEXT_PUBLIC_API_URL;

if (typeof window !== "undefined" && !window.__fetchIntercepted) {
  window.__fetchIntercepted = true;
  const originalFetch = window.fetch;
  window.fetch = async function (input, init) {
    let url = "";
    if (typeof input === "string") {
      url = input;
    } else if (input && typeof input === "object" && "url" in input) {
      url = input.url;
    }

    if (EXPRESS_URL && url.startsWith(EXPRESS_URL)) {
      const token = localStorage.getItem("sf_token");
      if (token) {
        init = init || {};
        const headers = new Headers(init.headers || {});
        if (!headers.has("Authorization")) {
          headers.set("Authorization", `Bearer ${token}`);
        }
        init.headers = headers;
      }
    }
    return originalFetch(input, init);
  };
}

export function useTokenSync() {
  const { data: session, isPending } = authClient.useSession();
  const synced = useRef(false);

  useEffect(() => {
    if (isPending) return;

    const user = session?.user;

    if (user && !synced.current) {
      synced.current = true;
      fetch("/api/auth/token", { method: "POST" })
        .then((res) => {
          if (!res.ok) throw new Error(`Failed to fetch backend token: ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (data.token) {
            localStorage.setItem("sf_token", data.token);
          } else {
            throw new Error("No token returned from backend");
          }
        })
        .catch((err) => {
          console.error("[TokenSync] Failed to sync JWT:", err);
          synced.current = false;
        });
    }

    if (!user) {
      localStorage.removeItem("sf_token");
      synced.current = false;
    }
  }, [session, isPending]);
}
