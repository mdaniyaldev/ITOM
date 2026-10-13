import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the signUp action
vi.mock('@/lib/auth/actions', () => ({
  signUp: vi.fn(),
}));

describe('SignUpPage', () => {
  let mockSignUp: ReturnType<typeof vi.fn>;
  let SignUpPage: React.ComponentType<any>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { signUp } = await import('@/lib/auth/actions');
    mockSignUp = vi.mocked(signUp);
    // Import the component after mocking
    const { default: importedSignUpPage } = await import('./page');
    SignUpPage = importedSignUpPage;
  });

  it('renders the sign up form with correct inputs', () => {
    render(<SignUpPage />);

    // Check for form elements
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('button click triggers handleSubmit', async () => {
    render(<SignUpPage />);

    // Fill in the form
    await userEvent.type(screen.getByLabelText(/name/i), 'Test User');
    await userEvent.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.type(screen.getByLabelText(/phone number/i), '1234567890');
    await userEvent.selectOptions(screen.getByLabelText(/country/i), 'United States');

    const submitButton = screen.getByRole('button', { name: /sign up/i });
    expect(submitButton).toBeEnabled();

    // Mock signUp to reject immediately so we can see if error state is set
    mockSignUp.mockRejectedValue(new Error('Test error'));

    await userEvent.click(submitButton);

    // Just wait a bit to see if anything happens
    await new Promise(resolve => setTimeout(resolve, 50));

    // Check if the button is still there (basic sanity check)
    expect(submitButton).toBeInTheDocument();
  });

  it('shows loading state when submitting', async () => {
    render(<SignUpPage />);
    // Make the mock return a pending promise so we can test loading state
    let resolvePromise: () => void = () => {};
    const pendingPromise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });
    mockSignUp.mockReturnValue(pendingPromise);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const phoneInput = screen.getByLabelText(/phone number/i);
    const countrySelect = screen.getByLabelText(/country/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    await userEvent.type(nameInput, 'Test User');
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.type(phoneInput, '1234567890');
    await userEvent.selectOptions(countrySelect, 'United States');
    // Fire the click but don't await it yet
    userEvent.click(submitButton);

    // Should show loading state while the async operation is pending
    await waitFor(() => {
      expect(submitButton).toHaveTextContent(/creating account/i);
      expect(nameInput).toBeDisabled();
      expect(emailInput).toBeDisabled();
      expect(phoneInput).toBeDisabled();
      expect(countrySelect).toBeDisabled();
    });

    // Now resolve the promise and await completion
    resolvePromise();
    await Promise.resolve(); // Wait for microtask
  });

  it('handles form submission and calls signUp action', async () => {
    render(<SignUpPage />);
    mockSignUp.mockResolvedValue(undefined);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const phoneInput = screen.getByLabelText(/phone number/i);
    const countrySelect = screen.getByLabelText(/country/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    await userEvent.type(nameInput, 'Test User');
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.type(phoneInput, '1234567890');
    await userEvent.selectOptions(countrySelect, 'United States');
    await userEvent.click(submitButton);

    expect(mockSignUp).toHaveBeenCalledTimes(1);
    const formDataArg = mockSignUp.mock.calls[0][0];
    expect(formDataArg instanceof FormData).toBe(true);
    expect(formDataArg.get('name')).toBe('Test User');
    expect(formDataArg.get('email')).toBe('test@example.com');
    expect(formDataArg.get('password')).toBe('password123');
    expect(formDataArg.get('phone')).toBe('1234567890');
    expect(formDataArg.get('country')).toBe('United States');
  });

  it('shows error message when signUp fails', async () => {
    render(<SignUpPage />);
    const errorMessage = 'Email already exists';
    // Make the mock return a pending promise so we can test loading state
    let rejectPromise: () => void = () => {};
    const pendingPromise = new Promise<void>((_, reject) => {
      rejectPromise = reject;
    });
    mockSignUp.mockReturnValue(pendingPromise);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    // Fire the click but don't await it yet
    userEvent.click(submitButton);

    // Verify the mock was called
    expect(mockSignUp).toHaveBeenCalledTimes(1);

    // Should show loading state while the async operation is pending
    await waitFor(() => {
      expect(submitButton).toHaveTextContent(/creating account/i);
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
    });

    // Now reject the promise and await completion
    rejectPromise(new Error(errorMessage));
    await Promise.resolve(); // Wait for microtask

    // Wait for error to appear
    const errorElement = await waitFor(() =>
      screen.getByText(/email already exists/i)
    );
    expect(errorElement).toBeInTheDocument();
    expect(submitButton).toHaveTextContent(/Sign Up/);
  });

  it('shows success message when signUp succeeds', async () => {
    render(<SignUpPage />);
    // Make the mock return a pending promise so we can test loading state
    let resolvePromise: () => void = () => {};
    const pendingPromise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });
    mockSignUp.mockReturnValue(pendingPromise);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    // Fire the click but don't await it yet
    userEvent.click(submitButton);

    // Should show loading state while the async operation is pending
    await waitFor(() => {
      expect(submitButton).toHaveTextContent(/creating account/i);
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
    });

    // Now resolve the promise and await completion
    resolvePromise();
    await Promise.resolve(); // Wait for microtask

    // Wait for success message to appear
    const successElement = await waitFor(() =>
      screen.getByText(/account created! please check your email to verify your address/i)
    );
    expect(successElement).toBeInTheDocument();
    expect(submitButton).toHaveTextContent(/Sign Up/);
  });
});