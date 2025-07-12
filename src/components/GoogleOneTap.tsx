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
    // Don't run if user is already authenticated
    if (status === "loading" || session) return;

    // Disable in development
    if (process.env.NODE_ENV === "development") return;

    const onLoad = () => {
      if (!window.google) return;

      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
        callback: async (response: any) => {
          if (response.credential) {
            // Here we will handle the login and save the user data to the database

            // Call NextAuth's signIn function to authenticate the user
            const res = await fetch('/api/auth/callback/credentials', {
              method: 'POST',
              body: JSON.stringify({ idToken: response.credential }),
              headers: {
                'Content-Type': 'application/json',
              },
            });

            if (res.ok) {
              // If login is successful, redirect to the homepage
              router.push('/');
            } else {
              // Handle error (optional: show a message)
              router.push('/auth/login'); // Redirect to login page if something fails
            }
          }
        },
        auto_select: true, // Auto select the account if it exists
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
