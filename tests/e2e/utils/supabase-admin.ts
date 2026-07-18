import { createClient } from '@supabase/supabase-js';

// Read from process.env (Playwright automatically loads .env.local if configured, or we fall back)
// We need the SERVICE_ROLE_KEY to bypass RLS and delete users from auth.users directly.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY is not defined. Test cleanup will not work locally unless set.');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || '', {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Deletes a user by their email address using the Supabase Admin API.
 * This is used for E2E test cleanup to avoid polluting the local development database.
 */
export async function deleteTestUserByEmail(email: string) {
  if (!supabaseServiceKey) {
    console.warn(`Skipping cleanup for ${email}: Service Role Key missing.`);
    return;
  }

  try {
    // Note: listUsers is a paginated API, but for tests with unique emails, we just search.
    // However, Supabase Admin API doesn't have a direct "getUserByEmail". 
    // We can list all users and filter, or just run a Postgres query if we want to be faster.
    // Let's use listUsers and filter (acceptable for local dev with few users).

    // In local dev, listUsers is fast enough.
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      throw listError;
    }

    const user = users.find(u => u.email === email);

    if (!user) {
      console.log(`User ${email} not found for cleanup. It may have failed to register.`);
      return;
    }

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (deleteError) {
      throw deleteError;
    }

    console.log(`Successfully cleaned up test user: ${email}`);
  } catch (error) {
    console.error(`Failed to clean up test user ${email}:`, error);
  }
}

/**
 * Creates a fully onboarded user for E2E testing to bypass the onboarding UI flow.
 * Returns the created user object.
 */
export async function createTestUser(email: string, password = 'ValidPass123!') {
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required to create a test user directly.');
  }

  const { data: { user }, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      display_name: 'E2E User',
      onboarding_completed: true,
    }
  });

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error('Failed to create user: user is null');
  }

  const { error: prefsError } = await supabaseAdmin
    .from('user_preferences')
    .update({ primary_currency_code: 'USD' })
    .eq('profile_id', user.id);

  if (prefsError) {
    throw prefsError;
  }

  return user;
}
