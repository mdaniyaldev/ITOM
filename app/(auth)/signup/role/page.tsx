'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { selectRole } from '@/lib/auth/actions';

export default function SelectRolePage() {
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
      await selectRole(formData);
      // If successful, redirect will happen in the action
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-10">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl">Select Your Role</CardTitle>
        <CardDescription>
          Choose how you'd like to participate in the ITOM platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="role" className="mb-2 text-sm font-medium text-muted-foreground block">
              Role
            </label>
            <select
              id="role"
              name="role"
              defaultValue="inventor"
              disabled={loading}
              className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select a role</option>
              <option value="inventor">Inventor</option>
              <option value="investor">Investor</option>
              <option value="author">Author</option>
            </select>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/80"
          >
            {loading ? 'Saving role...' : 'Continue'}
          </Button>

          {error && (
            <p className="mt-4 text-sm text-destructive">{error}</p>
          )}

          {success && (
            <p className="mt-4 text-sm text-success">
              Role saved! Redirecting...
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}