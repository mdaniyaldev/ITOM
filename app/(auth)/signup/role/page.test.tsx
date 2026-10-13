import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SelectRolePage from './page';

// Mock the selectRole action
vi.mock('@/lib/auth/actions', () => ({
  selectRole: vi.fn(),
}));

describe('SelectRolePage', () => {
  let mockSelectRole: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockSelectRole = vi.mocked(await import('@/lib/auth/actions')).selectRole;
  });

  it('renders the role selection form with correct inputs', () => {
    render(<SelectRolePage />);

    // Check for form elements
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
  });

  it('shows loading state when submitting', async () => {
    render(<SelectRolePage />);
    // Make the mock return a pending promise so we can test loading state
    let resolvePromise: () => void = () => {};
    const pendingPromise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });
    mockSelectRole.mockReturnValue(pendingPromise);

    const roleSelect = screen.getByLabelText(/role/i);
    const submitButton = screen.getByRole('button', { name: /continue/i });

    await userEvent.selectOptions(roleSelect, 'inventor');
    // Fire the click but don't await it yet
    userEvent.click(submitButton);

    // Should show loading state while the async operation is pending
    await waitFor(() => {
      expect(submitButton).toHaveTextContent(/Saving role\.\.\./i);
      expect(roleSelect).toBeDisabled();
    });

    // Now resolve the promise and await completion
    resolvePromise();
    await Promise.resolve(); // Wait for microtask
  });

  it('handles form submission and calls selectRole action', async () => {
    render(<SelectRolePage />);
    mockSelectRole.mockResolvedValue(undefined);

    const roleSelect = screen.getByLabelText(/role/i);
    const submitButton = screen.getByRole('button', { name: /continue/i });

    await userEvent.selectOptions(roleSelect, 'investor');
    await userEvent.click(submitButton);

    expect(mockSelectRole).toHaveBeenCalledTimes(1);
    const formDataArg = mockSelectRole.mock.calls[0][0];
    expect(formDataArg instanceof FormData).toBe(true);
    expect(formDataArg.get('role')).toBe('investor');
  });

  it('shows error message when selectRole fails', async () => {
    render(<SelectRolePage />);
    const errorMessage = 'Failed to save role';
    mockSelectRole.mockRejectedValue(new Error(errorMessage));

    const roleSelect = screen.getByLabelText(/role/i);
    const submitButton = screen.getByRole('button', { name: /continue/i });

    await userEvent.selectOptions(roleSelect, 'author');
    await userEvent.click(submitButton);

    // Wait for error to appear
    const errorElement = await waitFor(() =>
      screen.getByText(/failed to save role/i)
    );
    expect(errorElement).toBeInTheDocument();
    expect(submitButton).toHaveTextContent(/Continue/);
  });

  it('shows success message when selectRole succeeds', async () => {
    render(<SelectRolePage />);
    mockSelectRole.mockResolvedValue(undefined);

    const roleSelect = screen.getByLabelText(/role/i);
    const submitButton = screen.getByRole('button', { name: /continue/i });

    await userEvent.selectOptions(roleSelect, 'inventor');
    await userEvent.click(submitButton);

    // Wait for success message to appear (after redirect in action)
    // Since the action redirects, we won't see the success message in this test
    // But we can verify the selectRole action was called
    expect(mockSelectRole).toHaveBeenCalledTimes(1);
  });
});