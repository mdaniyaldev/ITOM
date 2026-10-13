'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function VerifyEmailPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkEmailConfirmation() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: userData } = await supabase
            .from('users')
            .select('email_confirmed_at')
            .eq('id', user.id)
            .single();

          if (userData?.email_confirmed_at) {
            router.replace('/signup/role');
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    checkEmailConfirmation();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] w-full flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground">
              Checking your email...
            </h2>
          </div>
        </div>
      </div>
    );
  }

  // If not verified or no user, show the verify email page
  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground">
            Check your email
          </h2>
          <p className="text-muted-foreground">
            We've sent a verification link to your email. Please click the link to verify your address, then return here.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => {
              // In a real app, we would call a server action to resend the verification email
              // For now, we just show a toast or alert
              alert('Verification email resent! (This is a demo)');
            }}
            className="w-full flex items-center justify-center px-4 py-2 border border-input bg-background rounded-md hover:bg-muted text-sm font-medium"
          >
            Resend verification email
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Didn't receive the email? <a href="#" className="underline">Contact support</a>
        </p>
      </div>
    </div>
  );
}