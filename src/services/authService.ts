import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { UserProfile } from '../types';

export const authService = {
  // Sign up customer with email and password
  async signUp(email: string, password: string, fullName: string, phone?: string): Promise<{ user: any; error?: string }> {
    if (!isSupabaseConfigured) {
      return { user: { id: `user-${Date.now()}`, email, user_metadata: { full_name: fullName } } };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone || ''
          }
        }
      });

      if (error) throw error;
      return { user: data.user };
    } catch (err: any) {
      return { user: null, error: err.message };
    }
  },

  // Sign in customer or admin
  async signIn(email: string, password: string): Promise<{ user: any; error?: string }> {
    if (!isSupabaseConfigured) {
      return { user: { id: `user-${Date.now()}`, email } };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { user: data.user };
    } catch (err: any) {
      return { user: null, error: err.message };
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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/account?action=reset-password`
      });
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Get current user session
  async getCurrentSession() {
    if (!isSupabaseConfigured) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  // Check if current user is an administrator
  async checkIsAdmin(userId?: string): Promise<boolean> {
    if (!isSupabaseConfigured) {
      // Local fallback: allow admin access if query param or stored token
      return localStorage.getItem('dorasani_admin_override') === 'true';
    }

    try {
      const session = await this.getCurrentSession();
      const targetUserId = userId || session?.user?.id;
      if (!targetUserId) return false;

      // 1. Direct call to security definer function is_admin
      const { data: isAdminRpc, error: rpcErr } = await supabase.rpc('is_admin');
      if (!rpcErr && typeof isAdminRpc === 'boolean') {
        return isAdminRpc;
      }

      // 2. Fallback query to user_roles table
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', targetUserId)
        .in('role', ['super_admin', 'admin', 'catalog_manager', 'inventory_manager', 'order_manager']);

      if (error) return false;
      return Boolean(data && data.length > 0);
    } catch {
      return false;
    }
  },

  // Get customer profile
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) return null;
      return {
        id: data.id,
        fullName: data.full_name,
        email: data.email,
        phone: data.phone || '',
        whatsappOptIn: Boolean(data.whatsapp_opt_in)
      };
    } catch {
      return null;
    }
  },

  // Update profile
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
    if (!isSupabaseConfigured) return true;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updates.fullName,
          phone: updates.phone,
          whatsapp_opt_in: updates.whatsappOptIn
        })
        .eq('id', userId);

      return !error;
    } catch {
      return false;
    }
  }
};
