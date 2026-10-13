import { signUp, signIn, forgotPassword, resetPassword, selectRole } from './actions';

// Mock the Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('auth actions', () => {
  let mockSupabase: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup mock Supabase client
    mockSupabase = {
      auth: {
        signUp: vi.fn().mockResolvedValue({ error: null, data: { id: 'test-user-id' } }),
        signInWithPassword: vi.fn().mockResolvedValue({ error: null, data: { id: 'test-user-id' } }),
        resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
        updateUser: vi.fn().mockResolvedValue({ error: null }),
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } } }),
      },
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: null }),
      }),
    };
    (await import('@/lib/supabase/server')).createClient.mockResolvedValue(mockSupabase);
  });

  describe('signUp', () => {
    it('should call supabase auth signUp with correct parameters', async () => {
      const formData = new FormData();
      formData.append('name', 'Test User');
      formData.append('email', 'test@example.com');
      formData.append('password', 'password123');
      formData.append('phone', '1234567890');
      formData.append('country', 'US');

      await signUp(formData);

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            name: 'Test User',
            phone: '1234567890',
            country: 'US',
          },
        },
      });
    });

    it('should throw error if supabase returns an error', async () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'password123');

      mockSupabase.auth.signUp.mockResolvedValue({ error: { message: 'Email already exists' } });

      await expect(signUp(formData)).rejects.toThrow('Email already exists');
    });

    it('should redirect to verify email on success', async () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'password123');

      await signUp(formData);

      expect((await import('next/navigation')).redirect).toHaveBeenCalledWith('/verify-email');
    });
  });

  describe('signIn', () => {
    it('should call supabase auth signInWithPassword with correct parameters', async () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'password123');

      await signIn(formData);

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should throw error if supabase returns an error', async () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'wrongpassword');

      mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: { message: 'Invalid credentials' } });

      await expect(signIn(formData)).rejects.toThrow('Invalid credentials');
    });

    it('should redirect to home on success', async () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');
      formData.append('password', 'password123');

      await signIn(formData);

      expect((await import('next/navigation')).redirect).toHaveBeenCalledWith('/');
    });
  });

  describe('forgotPassword', () => {
    it('should call supabase auth resetPasswordForEmail with correct parameters', async () => {
      const formData = new FormData();
      formData.append('email', 'test@example.com');

      await forgotPassword(formData);

      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.any(Object)
      );
    });

    it('should throw error if supabase returns an error', async () => {
      const formData = new FormData();
      formData.append('email', 'nonexistent@example.com');

      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: { message: 'Email not found' } });

      await expect(forgotPassword(formData)).rejects.toThrow('Email not found');
    });
  });

  describe('resetPassword', () => {
    it('should call supabase auth updateUser with correct parameters', async () => {
      const formData = new FormData();
      formData.append('password', 'newpassword123');
      formData.append('token', 'reset-token');

      await resetPassword(formData);

      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'newpassword123',
      });
    });

    it('should throw error if supabase returns an error', async () => {
      const formData = new FormData();
      formData.append('password', 'newpassword123');
      formData.append('token', 'reset-token');

      mockSupabase.auth.updateUser.mockResolvedValue({ error: { message: 'Invalid token' } });

      await expect(resetPassword(formData)).rejects.toThrow('Invalid token');
    });

    it('should redirect to sign in on success', async () => {
      const formData = new FormData();
      formData.append('password', 'newpassword123');
      formData.append('token', 'reset-token');

      await resetPassword(formData);

      expect((await import('next/navigation')).redirect).toHaveBeenCalledWith('/signin');
    });
  });

  describe('selectRole', () => {
    it('should throw error if no user found', async () => {
      const formData = new FormData();
      formData.append('role', 'inventor');

      (await import('@/lib/supabase/server')).createClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
      });

      await expect(selectRole(formData)).rejects.toThrow('No user found');
    });

    it('should insert user role with correct parameters', async () => {
      const formData = new FormData();
      formData.append('role', 'inventor');

      // Update the existing mockSupabase object
      mockSupabase.auth.getUser = vi.fn().mockResolvedValue({
        data: { user: { id: 'user-id' } },
      });
      mockSupabase.from = vi.fn().mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: null }),
      });

      (await import('@/lib/supabase/server')).createClient.mockResolvedValue(mockSupabase);

      await selectRole(formData);

      expect(mockSupabase.from).toHaveBeenCalledWith('user_roles');
      expect(mockSupabase.from().insert).toHaveBeenCalledWith({
        user_id: 'user-id',
        role: 'inventor',
        is_approved: false,
      });
    });

    it('should throw error if supabase returns an error', async () => {
      const formData = new FormData();
      formData.append('role', 'inventor');

      (await import('@/lib/supabase/server')).createClient.mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-id' } },
          }),
        },
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockResolvedValue({ error: { message: 'Database error' } }),
        }),
      });

      await expect(selectRole(formData)).rejects.toThrow('Database error');
    });

    it('should redirect to home on success', async () => {
      const formData = new FormData();
      formData.append('role', 'inventor');

      // Update the existing mockSupabase object
      mockSupabase.auth.getUser = vi.fn().mockResolvedValue({
        data: { user: { id: 'user-id' } },
      });
      mockSupabase.from = vi.fn().mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: null }),
      });

      (await import('@/lib/supabase/server')).createClient.mockResolvedValue(mockSupabase);

      await selectRole(formData);

      expect((await import('next/navigation')).redirect).toHaveBeenCalledWith('/');
    });
  });
});