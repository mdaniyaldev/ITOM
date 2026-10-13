'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

/**
 * Sign up a new user with email and password.
 * @param formData - FormData containing name, email, password, phone, country
 */
export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const data = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    phone: formData.get('phone') as string,
    country: formData.get('country') as string,
  };

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        name: data.name,
        phone: data.phone,
        country: data.country,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  // After sign up, redirect to verify email page
  redirect('/verify-email');
}

/**
 * Sign in an existing user with email and password.
 * @param formData - FormData containing email and password
 */
export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) {
    throw new Error(error.message);
  }

  // After sign in, check if user has selected a role
  // We'll redirect to a page that checks for role selection
  // For now, redirect to home; the middleware or page will handle role redirection
  redirect('/');
}

/**
 * Request a password reset email.
 * @param formData - FormData containing email
 */
export async function forgotPassword(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // You can set a redirect URL here if needed
    // redirectTo: `${window.origin}/reset-password`,
  });

  if (error) {
    throw new Error(error.message);
  }

  // In a real app, you might show a success message
  // For now, we just return
}

/**
 * Reset password with a token.
 * @param formData - FormData containing password and token
 */
export async function resetPassword(formData: FormData) {
  const supabase = await createClient();

  const password = formData.get('password') as string;
  // Note: In Next.js 13.4+, the token might be in searchParams, not formData
  // We'll assume the token is passed in a hidden field or we get it from URL
  // For simplicity, we expect the token to be in formData as well
  const token = formData.get('token') as string;

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    throw new Error(error.message);
  }

  // After reset, redirect to sign in
  redirect('/signin');
}

/**
 * Select a role after email verification.
 * @param formData - FormData containing role
 */
export async function selectRole(formData: FormData) {
  const supabase = await createClient();

  const role = formData.get('role') as string;

  // Get the current user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('No user found');
  }

  // Insert into user_roles table
  // We rely on RLS policies to allow the user to insert their own role
  const { error } = await supabase.from('user_roles').insert({
    user_id: user.id,
    role: role,
    is_approved: false, // Default to false until admin approves
  });

  if (error) {
    throw new Error(error.message);
  }

  // After role selection, redirect to home page
  redirect('/');
}