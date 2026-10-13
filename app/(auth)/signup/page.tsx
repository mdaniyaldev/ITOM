'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { signUp } from '@/lib/auth/actions';

export default function SignUpPage() {
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
      await signUp(formData);
      // If signUp succeeds, it will redirect via redirect() in the action
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-10">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl">Sign Up</CardTitle>
        <CardDescription>
          Create your ITOM account to connect with inventors, investors, and case study authors.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="mb-2 text-sm font-medium text-muted-foreground block">
              Name
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              required
              disabled={loading}
            />
          </div>
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
          <div className="space-y-2">
            <label htmlFor="phone" className="mb-2 text-sm font-medium text-muted-foreground block">
              Phone Number
            </label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="country" className="mb-2 text-sm font-medium text-muted-foreground block">
              Country
            </label>
            <select
              id="country"
              name="country"
              required
              disabled={loading}
              className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select a country</option>
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Australia">Australia</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
              <option value="India">India</option>
              <option value="Japan">Japan</option>
              {/* Add more as needed */}
            </select>
          </div>

          {/* Google OAuth button (disabled/coming soon) */}
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
            {loading ? 'Creating account...' : 'Sign Up'}
          </Button>

          {error && (
            <p className="mt-4 text-sm text-destructive">{error}</p>
          )}

          {success && (
            <p className="mt-4 text-sm text-success">
              Account created! Please check your email to verify your address.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}