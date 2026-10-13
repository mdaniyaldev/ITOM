import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResetPasswordPage from './page';

// Mock the resetPassword action
vi.mock('@/lib/auth/actions', () => ({
  resetPassword: vi.fn(),
}));

// Mock useSearchParams hook and redirect
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
  redirect: vi.fn(),
}));

describe('ResetPasswordPage', () => {
  let mockUseSearchParams: ReturnType<typeof vi.fn>;
  let mockResetPassword: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockResetPassword = vi.mocked(await import('@/lib/auth/actions')).resetPassword;
    mockUseSearchParams = vi.mocked(await import('next/navigation')).useSearchParams;
  });

  describe('when token is missing', () => {
    beforeEach(() => {
      mockUseSearchParams.mockReturnValue({
        get: vi.fn().mockReturnValue(null),
      });
    });

    it('renders invalid link message', () => {
      render(<ResetPasswordPage />);
      expect(screen.getByText(/invalid link/i)).toBeInTheDocument();
      expect(screen.getByText(/the password reset link is invalid or has expired/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go to forgot password/i })).toBeInTheDocument();
    });
  });

  describe('when token is present', () => {
    beforeEach(() => {
      mockUseSearchParams.mockReturnValue({
        get: vi.fn().mockReturnValue('valid-token'),
      });
    });

    it('renders the reset password form with correct inputs', () => {
      render(<ResetPasswordPage />);
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    });

    it('shows loading state when submitting', async () => {
      render(<ResetPasswordPage />);
      // Make the mock return a pending promise so we can test loading state
      let resolvePromise: () => void = () => {};
      const pendingPromise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      mockResetPassword.mockReturnValue(pendingPromise);

      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      await userEvent.type(passwordInput, 'newpassword123');
      await userEvent.type(confirmPasswordInput, 'newpassword123');
      // Fire the click but don't await it yet
      userEvent.click(submitButton);

      // Should show loading state while the async operation is pending
      await waitFor(() => {
        expect(submitButton).toHaveTextContent(/Resetting password\.\.\./i);
        expect(passwordInput).toBeDisabled();
        expect(confirmPasswordInput).toBeDisabled();
      });

      // Now resolve the promise and await completion
      resolvePromise();
      await Promise.resolve(); // Wait for microtask
    });

    it('handles form submission and calls resetPassword action', async () => {
      render(<ResetPasswordPage />);
      mockResetPassword.mockResolvedValue(undefined);

      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      await userEvent.type(passwordInput, 'newpassword123');
      await userEvent.type(confirmPasswordInput, 'newpassword123');
      await userEvent.click(submitButton);

      expect(mockResetPassword).toHaveBeenCalledTimes(1);
      const formDataArg = mockResetPassword.mock.calls[0][0];
      expect(formDataArg instanceof FormData).toBe(true);
      expect(formDataArg.get('token')).toBe('valid-token');
      expect(formDataArg.get('password')).toBe('newpassword123');
    });

    it('shows error message when passwords do not match', async () => {
      render(<ResetPasswordPage />);
      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      await userEvent.type(passwordInput, 'newpassword123');
      await userEvent.type(confirmPasswordInput, 'differentpassword');
      await userEvent.click(submitButton);

      // Should show error message
      const errorElement = await screen.findByText(/passwords do not match/i);
      expect(errorElement).toBeInTheDocument();
      expect(submitButton).toBeEnabled(); // Button should still be enabled
      expect(passwordInput).toBeEnabled();
      expect(confirmPasswordInput).toBeEnabled();
    });

    it('shows error message when resetPassword fails', async () => {
      render(<ResetPasswordPage />);
      const errorMessage = 'Invalid token';
      // Make the mock reject after a short delay so we can test loading state if needed
      mockResetPassword.mockRejectedValue(new Error(errorMessage));

      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      await userEvent.type(passwordInput, 'newpassword123');
      await userEvent.type(confirmPasswordInput, 'newpassword123');
      await userEvent.click(submitButton);

      // Wait for error to appear
      const errorElement = await waitFor(() =>
        screen.getByText(/invalid token/i)
      );
      expect(errorElement).toBeInTheDocument();
      expect(submitButton).toHaveTextContent(/Reset Password/);
    });

    it('shows success message when resetPassword succeeds', async () => {
      render(<ResetPasswordPage />);
      mockResetPassword.mockResolvedValue({ error: null });

      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /reset password/i });

      await userEvent.type(passwordInput, 'newpassword123');
      await userEvent.type(confirmPasswordInput, 'newpassword123');
      await userEvent.click(submitButton);

      // Wait for success message to appear
      const successMessage = await waitFor(() =>
        screen.getByText(/password has been reset/i)
      );
      expect(successMessage).toBeInTheDocument();
      expect(submitButton).toHaveTextContent(/Reset Password/);
    });
  });
});