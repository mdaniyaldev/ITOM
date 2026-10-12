"use client";

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Sign in successful, redirect to the intended page or home
    router.push('/')
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
    }
    // The signInWithOAuth method will redirect the user, so we don't need to handle the success case here.
  }

  useEffect(() => {
    // Check if there's a session and redirect to home if already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/')
      }
    }
    checkSession()
  }, [router, supabase])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Signing in...</p>
      </div>
    </div>
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Sign in to ITOM</h1>
          <p className="text-muted-foreground">
            Access your inventor/investor platform
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive rounded-md p-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-muted-foreground">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-muted-foreground">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Sign in with Email
          </Button>
        </form>

        <div className="flex items-center">
          <div className="h-px bg-border flex-1"></div>
          <span className="px-2 text-muted-foreground">Or continue with</span>
          <div className="h-px bg-border flex-1"></div>
        </div>

        <Button
          variant="outline"
          onClick={handleGoogleSignIn}
          className="w-full"
        >
          Sign in with Google
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            Don't have an account?{' '}
            <a href="/auth/register" className="text-primary underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}