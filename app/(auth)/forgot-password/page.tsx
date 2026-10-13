'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { forgotPassword } from '@/lib/auth/actions';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData(event.currentTarget);
      await forgotPassword(formData);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-10">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl">Forgot Password</CardTitle>
        <CardDescription>
          Enter your email address to receive a password reset link.
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

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/80"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>

          {error && (
            <p className="mt-4 text-sm text-destructive">{error}</p>
          )}

          {success && (
            <p className="mt-4 text-sm text-success">
              If an account exists with that email, you will receive a password reset link shortly.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}