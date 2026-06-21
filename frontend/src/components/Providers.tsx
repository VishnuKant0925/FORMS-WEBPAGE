'use client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useEffect } from 'react';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * Providers wraps the app in GoogleOAuthProvider and restores
 * the user session on page load by calling the refresh endpoint.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  const { setLoading } = useAuthStore();

  useEffect(() => {
    // Attempt to restore session from httpOnly refresh token cookie
    authService.refreshToken().finally(() => setLoading(false));
  }, [setLoading]);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const isGoogleConfigured = clientId && clientId !== 'your-google-client-id-here';

  if (!isGoogleConfigured) {
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
