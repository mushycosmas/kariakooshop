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
     // router.push('/seller/dashboard'); 
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
              console.log("Google One Tap credential received:", response.credential);

            // Use NextAuth signIn with GoogleProvider
            signIn("google", { 
              callbackUrl: "/seller/dashboard" 
            });

           
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
