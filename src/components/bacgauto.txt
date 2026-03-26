import { useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
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
      // Optionally, you can redirect users who are already logged in
      router.push('/seller/dashboard'); // Example: Redirect logged-in users
    } else {
      console.log('User is not logged in');
    }

    // If in development, prevent Google One Tap from loading
    if (process.env.NODE_ENV === "development") return;

    const onLoad = () => {
      if (!window.google) return;

      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
        callback: async (response: any) => {
          if (response.credential) {
            // After getting the credential, send it to your API for validation and session creation
            const res = await fetch('/api/auth/callback/credentials', {
              method: 'POST',
              body: JSON.stringify({ idToken: response.credential }),
              headers: {
                'Content-Type': 'application/json',
              },
            });

            if (res.ok) {
              // Get session data after login
              const sessionData = await res.json();
              console.log('Session data after Google login:', sessionData);

              // Use NextAuth's `signIn` method to authenticate the session
              // Pass the 'google' provider and idToken to the signIn function
              signIn('credentials', { 
                token: response.credential,
                redirect: false,
              }).then((response) => {
                // If signIn was successful, redirect the user
                if (response?.ok) {
                  router.push('/seller/dashboard'); // Redirect to dashboard after successful login
                } else {
                  console.error('Error signing in via Google');
                }
              });
            } else {
              console.error('Failed to log in');
            }
          }
        },
        auto_select: true, // Automatically select the account if it exists
        cancel_on_tap_outside: false,
        use_fedcm_for_prompt: false,
      });

      // Prompt for Google One Tap to sign in the user
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
