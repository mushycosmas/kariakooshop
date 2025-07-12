"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; // For routing

declare global {
  interface Window {
    google?: any;
  }
}

export default function GoogleOneTap() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Check if session exists, if so, redirect to dashboard
    if (status === "loading") return; // Don't do anything while loading
    if (session) {
      router.push('/seller/dashboard'); // Redirect to seller dashboard if session exists
      return;
    }

    // If in development, prevent Google One Tap from loading
    if (process.env.NODE_ENV === "development") return;

    const onLoad = () => {
      if (!window.google) return;

      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
        callback: async (response: any) => {
          if (response.credential) {
            // Sign in with credentials after getting the ID token
            const res = await fetch('/api/auth/callback/credentials', {
              method: 'POST',
              body: JSON.stringify({ idToken: response.credential }),
              headers: {
                'Content-Type': 'application/json',
              },
            });

            if (res.ok) {
              // After successful login, the session should be available
              // Redirect to seller dashboard
              router.push('/seller/dashboard');
            } else {
              // Handle error if authentication fails
              router.push('/auth/login'); // Redirect to login if something goes wrong
            }
          }
        },
        auto_select: true, // Automatically select the account if it exists
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
  }, [session, status, router]);

  return null;
}
