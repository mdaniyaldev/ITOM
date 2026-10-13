'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { signIn } from '@/lib/auth/actions';

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      await signIn(formData);
      // If signIn succeeds, it will redirect via redirect() in the action
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-10">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl">Sign In</CardTitle>
        <CardDescription>
          Access your ITOM account to connect with inventors, investors, and case study authors.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="mb-2 text-sm font-medium text-muted-foreground block">
              Email Address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="mb-2 text-sm font-medium text-muted-foreground block">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              minLength={8}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              disabled
              className="w-full"
            >
              Continue with Google
            </Button>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/80"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>

          {error && (
            <p className="mt-4 text-sm text-destructive">{error}</p>
          )}

          <div className="mt-4 text-sm">
            <a href="/forgot-password" className="underline text-muted-foreground hover:text-foreground">
              Forgot password?
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}