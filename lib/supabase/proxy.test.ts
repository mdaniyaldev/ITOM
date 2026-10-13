import { updateSession } from './proxy';
import { NextResponse, type NextRequest } from 'next/server';

// Variables to control mock behavior
let hasEnvVarsValue = true;
let isAuthenticatedValue = true;

// Mocks need to be at the top level due to hoisting
vi.mock('../utils', () => ({
  hasEnvVars: () => hasEnvVarsValue,
}));
vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: {
      getClaims: () => {
        if (isAuthenticatedValue) {
          return Promise.resolve({ data: { claims: { sub: 'user-id', email: 'test@example.com' } } });
        } else {
          return Promise.resolve({ data: { claims: null } });
        }
      },
    },
    cookies: {
      getAll: vi.fn(),
      set: vi.fn(),
    },
  }),
}));

describe('updateSession', () => {
  let mockRequest: Partial<NextRequest>;
  let mockSupabaseResponse: any;

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    vi.spyOn(NextResponse, 'next');
    vi.spyOn(NextResponse, 'redirect');

    // Reset control variables to defaults
    hasEnvVarsValue = true;
    isAuthenticatedValue = true;

    // Setup default mock request
    const clonedUrl = {
      pathname: '/',
      set: vi.fn((pathname: string) => {
        clonedUrl.pathname = pathname;
      }),
      toString: vi.fn(() => {
        // Return just the pathname for relative URLs
        return clonedUrl.pathname;
      }),
    };

    mockRequest = {
      nextUrl: {
        pathname: '/',
        clone: vi.fn(() => clonedUrl),
      },
      cookies: {
        getAll: vi.fn().mockReturnValue([]),
        set: vi.fn(),
      },
    };

    // Setup mock Supabase response
    mockSupabaseResponse = NextResponse.next({
      request: mockRequest as NextRequest,
    });

    // Mock NextResponse.next to return our mock response
    (vi.spyOn(NextResponse, 'next') as any).mockImplementation(() => mockSupabaseResponse);

    // Mock NextResponse.redirect to return a mock redirect response
    (vi.spyOn(NextResponse, 'redirect') as any).mockImplementation((url: string) => {
      return new Response(null, {
        status: 302,
        headers: {
          location: url
        }
      });
    });
  });

  describe('when env vars are not set', () => {
    beforeEach(() => {
      // Mock hasEnvVars to return false
      hasEnvVarsValue = false;
    });

    it('should return supabaseResponse without checking auth', async () => {
      const result = await updateSession(mockRequest as NextRequest);
      expect(result).toBe(mockSupabaseResponse);
    });
  });

  describe('when env vars are set', () => {
    beforeEach(() => {
      // Mock hasEnvVars to return true
      hasEnvVarsValue = true;
    });

    describe('and user is not authenticated', () => {
      beforeEach(() => {
        // Mock Supabase getClaims to return no user
        isAuthenticatedValue = false;
      });

      describe('and trying to access a protected path', () => {
        beforeEach(() => {
          mockRequest.nextUrl.pathname = '/dashboard';
        });

        it('should redirect to sign in page', async () => {
          const result = await updateSession(mockRequest as NextRequest);
          expect(result.status).toBe(302);
          expect(result.headers.get('location')).toBe('/signin');
        });
      });

      describe('and trying to access a public path', () => {
        beforeEach(() => {
          mockRequest.nextUrl.pathname = '/signin';
        });

        it('should allow access and return supabaseResponse', async () => {
          const result = await updateSession(mockRequest as NextRequest);
          expect(result).toBe(mockSupabaseResponse);
        });
      });
    });

    describe('and user is authenticated', () => {
      beforeEach(() => {
        // Mock Supabase getClaims to return a user
        isAuthenticatedValue = true;
      });

      it('should allow access and return supabaseResponse', async () => {
        mockRequest.nextUrl.pathname = '/dashboard';
        const result = await updateSession(mockRequest as NextRequest);
        expect(result).toBe(mockSupabaseResponse);
      });
    });
  });
});