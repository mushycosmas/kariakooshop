import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; // For routing

declare global {
  interface Window {
    google?: any;
  }
}

export default function GoogleOneTap() {
  const { data: session, status } = useSession(); // Get the current session status
  const router = useRouter();

  useEffect(() => {
    // If session is loading, do nothing, just wait
    if (status === "loading") return;

    // If session exists, user is logged in and can navigate freely
    if (session) {
      console.log('User is logged in:', session);
    } else {
      console.log('User is not logged in');
      // Optionally, you can show a login prompt or perform other actions when there's no session
    }

    // If in development, prevent Google One Tap from loading
    if (process.env.NODE_ENV === "development") return;

    const onLoad = () => {
      if (!window.google) return;

      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
        callback: async (response: any) => {
          if (response.credential) {
            // After getting the credential, send it to your API for validation
            const res = await fetch('/api/auth/callback/credentials', {
              method: 'POST',
              body: JSON.stringify({ idToken: response.credential }),
              headers: {
                'Content-Type': 'application/json',
              },
            });

            if (res.ok) {
              // Successfully logged in, the session should be set by next-auth
              const sessionData = await res.json();
              console.log('Session data after Google login:', sessionData);
            } else {
              console.error('Failed to log in');
            }
          }
        },
        auto_select: true, // Automatically select the account if it exists
        cancel_on_tap_outside: false,
        use_fedcm_for_prompt: false,
      });

      window.google.accounts.id.prompt();
    };

    // Load Google One Tap script dynamically
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = onLoad;
    document.body.appendChild(script);

    return () => {
      // Cleanup script when the component is unmounted
      document.body.removeChild(script);
    };
  }, [session, status, router]);

  return null; // Nothing to render as this component handles auth silently
}
