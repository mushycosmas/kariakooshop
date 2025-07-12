"use client";

import { useEffect } from "react";
import { useSession, signIn } from "next-auth/react";

declare global {
  interface Window {
    google?: any;
  }
}

export default function GoogleOneTap() {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Don't run if user is already authenticated
    if (status === "loading" || session) return;

    // Disable in development
    if (process.env.NODE_ENV === "development") return;

    const onLoad = () => {
      if (!window.google) return;

      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
        callback: (response: any) => {
          if (response.credential) {
            signIn("credentials", {
              idToken: response.credential,
              redirect: false,
            });
          }
        },
        auto_select: true,
        cancel_on_tap_outside: false,
        use_fedcm_for_prompt: false,
      });

      window.google.accounts.id.prompt();
    };

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = onLoad;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [session, status]);

  return null;
}
