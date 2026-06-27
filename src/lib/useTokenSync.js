"use client";

import { useEffect, useRef } from "react";
import { authClient } from "@/lib/auth-client";

const EXPRESS_URL = process.env.NEXT_PUBLIC_API_URL;

// Intercept window.fetch to automatically add the Authorization header for Express API calls.
// This solves cross-site/third-party cookie blocking in production since we pass the JWT in the header.
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

    if (EXPRESS_URL) {
      try {
        // Parse hosts to compare them robustly (ignoring protocols, trailing slashes, and ports if matching)
        const targetHost = new URL(url, window.location.origin).host;
        const expressHost = new URL(EXPRESS_URL).host;

        if (targetHost === expressHost) {
          let token = localStorage.getItem("sf_token");
          
          // Race Condition Fix: If a session is active but the token hasn't synced yet,
          // wait up to 3 seconds for the token to appear in localStorage before proceeding.
          if (!token && localStorage.getItem("sf_user_active") === "true") {
            console.log("[Fetch Interceptor] Waiting for sf_token to sync...");
            for (let i = 0; i < 30; i++) {
              await new Promise((resolve) => setTimeout(resolve, 100));
              token = localStorage.getItem("sf_token");
              if (token) {
                console.log("[Fetch Interceptor] sf_token synced successfully!");
                break;
              }
            }
          }

          if (token) {
            init = init || {};
            const headers = new Headers(init.headers || {});
            if (!headers.has("Authorization")) {
              headers.set("Authorization", `Bearer ${token}`);
            }
            init.headers = headers;
          }
        }
      } catch (err) {
        console.error("[Fetch Interceptor] Error processing request URL:", err);
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

    if (user) {
      // Set active user flag so interceptor knows it should wait for sf_token if it's missing
      localStorage.setItem("sf_user_active", "true");

      if (!synced.current) {
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
    }

    if (!user) {
      localStorage.removeItem("sf_user_active");
      localStorage.removeItem("sf_token");
      synced.current = false;
    }
  }, [session, isPending]);
}
