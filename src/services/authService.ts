import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { UserProfile, UserRole } from '../types';

export interface UserRoleInfo {
  authenticated: boolean;
  userId?: string;
  email?: string;
  role: UserRole;
  isAdmin: boolean;
}

const ADMIN_ROLES: UserRole[] = [
  'super_admin',
  'admin',
  'catalog_manager',
  'inventory_manager',
  'order_manager',
];

const ROLE_PRIORITY: UserRole[] = [
  'super_admin',
  'admin',
  'catalog_manager',
  'inventory_manager',
  'order_manager',
  'support_agent',
  'customer',
];

export const authService = {
  // Sign up customer or configured admin with email and password
  async signUp(
    email: string,
    password: string,
    fullName: string,
    phone?: string
  ): Promise<{
    user: any;
    session: any;
    confirmationRequired?: boolean;
    alreadyExists?: boolean;
    error?: string;
  }> {
    const normalizedEmail = email.trim().toLowerCase();

    if (!isSupabaseConfigured) {
      return {
        user: {
          id: `user-${Date.now()}`,
          email: normalizedEmail,
          user_metadata: { full_name: fullName, phone: phone || '' },
        },
        session: { access_token: 'local' },
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            full_name: fullName.trim(),
            phone: phone?.trim() || '',
          },
        },
      });

      if (error) throw error;

      // Supabase returns empty identities when user is already registered (with confirmation enabled)
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        return {
          user: null,
          session: null,
          alreadyExists: true,
          error: 'An account with this email is already registered. Please sign in or reset your password.',
        };
      }

      const confirmationRequired = Boolean(data.user && !data.session);
      return {
        user: data.user,
        session: data.session,
        confirmationRequired,
      };
    } catch (err: any) {
      return { user: null, session: null, error: err.message };
    }
  },

  // Sign in customer or admin
  async signIn(
    email: string,
    password: string
  ): Promise<{ user: any; session: any; error?: string; emailUnconfirmed?: boolean }> {
    const normalizedEmail = email.trim().toLowerCase();

    if (!isSupabaseConfigured) {
      return {
        user: { id: `user-${Date.now()}`, email: normalizedEmail },
        session: { access_token: 'local' },
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) throw error;
      return { user: data.user, session: data.session };
    } catch (err: any) {
      const message = err?.message || 'Unable to sign in.';
      const emailUnconfirmed = message.toLowerCase().includes('email not confirmed');
      return { user: null, session: null, error: message, emailUnconfirmed };
    }
  },

  // Send passwordless one-time Magic Link email
  async signInWithMagicLink(email: string): Promise<{ success: boolean; error?: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      return { success: false, error: 'Please enter your email address.' };
    }
    if (!isSupabaseConfigured) return { success: true };

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Unable to send sign-in link.' };
    }
  },

  // Resend confirmation email
  async resendConfirmation(email: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) return { success: true };
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Sign out
  async signOut(): Promise<{ error?: string }> {
    if (!isSupabaseConfigured) return {};
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return {};
    } catch (err: any) {
      return { error: err.message };
    }
  },

  // Send password reset email
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) return { success: true };
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/account?action=reset-password`,
      });
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Update authenticated user password (e.g., after recovery link or from account page)
  async updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured) return { success: true };
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Request email address change (triggers confirmation email via Supabase Auth)
  async updateEmail(newEmail: string): Promise<{ success: boolean; error?: string }> {
    const normalizedEmail = newEmail.trim().toLowerCase();
    if (!normalizedEmail) {
      return { success: false, error: 'Please enter a valid new email address.' };
    }
    if (!isSupabaseConfigured) return { success: true };
    try {
      const { error } = await supabase.auth.updateUser(
        { email: normalizedEmail },
        { emailRedirectTo: `${window.location.origin}/account?action=email-updated` }
      );
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Unable to request email update.' };
    }
  },

  // Get current user session
  async getCurrentSession() {
    if (!isSupabaseConfigured) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  // Fetch & synchronize verified role info from DB (checks public.admin_emails & public.user_roles)
  async getUserRoleInfo(userId?: string): Promise<UserRoleInfo> {
    if (!isSupabaseConfigured) {
      return { authenticated: false, role: 'customer', isAdmin: false };
    }

    try {
      const { data: rpcData, error: rpcErr } = await supabase.rpc('get_my_role_info');
      if (!rpcErr && rpcData && typeof rpcData === 'object' && !Array.isArray(rpcData)) {
        const info = rpcData as Record<string, any>;
        if (info.authenticated) {
          return {
            authenticated: true,
            userId: info.user_id || userId,
            email: info.email || undefined,
            role: (info.role as UserRole) || 'customer',
            isAdmin: Boolean(info.is_admin),
          };
        }
        return { authenticated: false, role: 'customer', isAdmin: false };
      }

      const session = await this.getCurrentSession();
      const targetUserId = userId || session?.user?.id;
      if (!targetUserId) {
        return { authenticated: false, role: 'customer', isAdmin: false };
      }

      const [{ data: isAdminRpc }, { data: rolesData }] = await Promise.all([
        supabase.rpc('is_admin'),
        supabase.from('user_roles').select('role').eq('user_id', targetUserId),
      ]);

      const assignedRoles = (rolesData || []).map((r) => r.role as UserRole);
      const effectiveRole =
        ROLE_PRIORITY.find((r) => assignedRoles.includes(r)) || 'customer';
      const isAdmin = Boolean(isAdminRpc) || ADMIN_ROLES.includes(effectiveRole);

      return {
        authenticated: true,
        userId: targetUserId,
        email: session?.user?.email || undefined,
        role: effectiveRole,
        isAdmin,
      };
    } catch {
      return { authenticated: false, role: 'customer', isAdmin: false };
    }
  },

  // Check if current user is an administrator
  async checkIsAdmin(userId?: string): Promise<boolean> {
    const info = await this.getUserRoleInfo(userId);
    return info.isAdmin;
  },

  // Get customer profile
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) return null;
      return {
        id: data.id,
        fullName: data.full_name,
        email: data.email,
        phone: data.phone || '',
        avatarUrl: data.avatar_url || undefined,
        whatsappOptIn: Boolean(data.whatsapp_opt_in),
      };
    } catch {
      return null;
    }
  },

  // Update profile
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
    if (!isSupabaseConfigured) return true;
    try {
      const payload: {
        full_name?: string;
        phone?: string | null;
        whatsapp_opt_in?: boolean;
      } = {};
      if (updates.fullName !== undefined) payload.full_name = updates.fullName;
      if (updates.phone !== undefined) payload.phone = updates.phone;
      if (updates.whatsappOptIn !== undefined) payload.whatsapp_opt_in = updates.whatsappOptIn;
      if (Object.keys(payload).length === 0) return true;

      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', userId);

      return !error;
    } catch {
      return false;
    }
  },
};
