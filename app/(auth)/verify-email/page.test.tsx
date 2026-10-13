import { render, screen } from '@testing-library/react';
import VerifyEmailPage from './page';

// Mock the Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('VerifyEmailPage', () => {
  let mockSupabase: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup mock Supabase client
    mockSupabase = {
      auth: {
        getUser: vi.fn(),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn(),
          }),
        }),
      }),
    };
    (await import('@/lib/supabase/server')).createClient.mockResolvedValue(mockSupabase);
  });

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
      });
    });

    it('renders the verify email page', async () => {
      const Component = await VerifyEmailPage();
      render(Component);

      // Check for page content
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      expect(screen.getByText(/we've sent a verification link to your email/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /resend verification email/i })).toBeInTheDocument();
    });
  });

  describe('when user is authenticated but email not confirmed', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-id' } },
      });
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: { email_confirmed_at: null },
      });
    });

    it('renders the verify email page', async () => {
      const Component = await VerifyEmailPage();
      render(Component);

      // Check for page content
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      expect(screen.getByText(/we've sent a verification link to your email/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /resend verification email/i })).toBeInTheDocument();
    });
  });

  describe('when user is authenticated and email is confirmed', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-id' } },
      });
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: { email_confirmed_at: '2026-01-01T00:00:00Z' },
      });
    });

    it('redirects to signup role page', async () => {
      const Component = await VerifyEmailPage();
      // The component should have redirected, so we expect redirect to have been called
      expect((await import('next/navigation')).redirect).toHaveBeenCalledWith('/signup/role');
    });
  });
});