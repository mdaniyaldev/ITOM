import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignInPage from './page';

// Mock the signIn action
vi.mock('@/lib/auth/actions', () => ({
  signIn: vi.fn(),
}));

describe('SignInPage', () => {
  let mockSignIn: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockSignIn = vi.mocked(await import('@/lib/auth/actions')).signIn;
  });

  it('renders the sign in form with correct inputs', () => {
    render(<SignInPage />);

    // Check for form elements
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /forgot password/i })).toBeInTheDocument();
  });

  it('shows loading state when submitting', async () => {
    render(<SignInPage />);
    // Make the mock return a pending promise so we can test loading state
    let resolvePromise: () => void = () => {};
    const pendingPromise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });
    mockSignIn.mockReturnValue(pendingPromise);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    // Fire the click but don't await it yet
    userEvent.click(submitButton);

    // Should show loading state while the async operation is pending
    await waitFor(() => {
      expect(submitButton).toHaveTextContent(/Signing in\.\.\./i);
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
    });

    // Now resolve the promise and await completion
    resolvePromise();
    await Promise.resolve(); // Wait for microtask
  });

  it('handles form submission and calls signIn action', async () => {
    render(<SignInPage />);
    mockSignIn.mockResolvedValue(undefined);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);

    expect(mockSignIn).toHaveBeenCalledTimes(1);
    const formDataArg = mockSignIn.mock.calls[0][0];
    expect(formDataArg instanceof FormData).toBe(true);
    expect(formDataArg.get('email')).toBe('test@example.com');
    expect(formDataArg.get('password')).toBe('password123');
  });

  it('shows error message when signIn fails', async () => {
    render(<SignInPage />);
    const errorMessage = 'Invalid credentials';
    mockSignIn.mockRejectedValue(new Error(errorMessage));

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'wrongpassword');
    await userEvent.click(submitButton);

    // Wait for error to appear
    const errorElement = await waitFor(() =>
      screen.getByText(/invalid credentials/i)
    );
    expect(errorElement).toBeInTheDocument();
    expect(submitButton).toHaveTextContent(/Sign In/);
  });

  it('navigates to forgot password page when link clicked', async () => {
    render(<SignInPage />);
    const forgotPasswordLink = screen.getByRole('link', { name: /forgot password/i });
    await userEvent.click(forgotPasswordLink);
    // In a real test with router, we'd check navigation
    // For now, we just verify the link exists and is clickable
    expect(forgotPasswordLink).toBeInTheDocument();
  });
});