import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForgotPasswordPage from './page';

// Mock the forgotPassword action
vi.mock('@/lib/auth/actions', () => ({
  forgotPassword: vi.fn(),
}));

describe('ForgotPasswordPage', () => {
  let mockForgotPassword: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockForgotPassword = vi.mocked(await import('@/lib/auth/actions')).forgotPassword;
  });

  it('renders the forgot password form with correct inputs', () => {
    render(<ForgotPasswordPage />);

    // Check for form elements
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
  });

  it('shows loading state when submitting', async () => {
    render(<ForgotPasswordPage />);
    // Make the mock return a pending promise so we can test loading state
    let resolvePromise: () => void = () => {};
    const pendingPromise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });
    mockForgotPassword.mockReturnValue(pendingPromise);

    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    await userEvent.type(emailInput, 'test@example.com');
    // Fire the click but don't await it yet
    userEvent.click(submitButton);

    // Should show loading state while the async operation is pending
    await waitFor(() => {
      expect(submitButton).toHaveTextContent(/Sending\.\.\./i);
      expect(emailInput).toBeDisabled();
    });

    // Now resolve the promise and await completion
    resolvePromise();
    await Promise.resolve(); // Wait for microtask
  });

  it('handles form submission and calls forgotPassword action', async () => {
    render(<ForgotPasswordPage />);
    mockForgotPassword.mockResolvedValue(undefined);

    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.click(submitButton);

    expect(mockForgotPassword).toHaveBeenCalledTimes(1);
    const formDataArg = mockForgotPassword.mock.calls[0][0];
    expect(formDataArg instanceof FormData).toBe(true);
    expect(formDataArg.get('email')).toBe('test@example.com');
  });

  it('shows success message when forgotPassword succeeds', async () => {
    render(<ForgotPasswordPage />);
    mockForgotPassword.mockResolvedValue(undefined);

    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.click(submitButton);

    // Wait for success message to appear
    const successMessage = await waitFor(() =>
      screen.getByText(/if an account exists with that email/i)
    );
    expect(successMessage).toBeInTheDocument();
    expect(submitButton).toHaveTextContent(/Send Reset Link/);
  });

  it('shows error message when forgotPassword fails', async () => {
    render(<ForgotPasswordPage />);
    const errorMessage = 'Failed to send reset email';
    mockForgotPassword.mockRejectedValue(new Error(errorMessage));

    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.click(submitButton);

    // Wait for error to appear
    const errorElement = await waitFor(() =>
      screen.getByText(/failed to send reset email/i)
    );
    expect(errorElement).toBeInTheDocument();
    expect(submitButton).toHaveTextContent(/Send Reset Link/);
  });
});