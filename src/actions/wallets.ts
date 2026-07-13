'use server';

import { revalidatePath } from 'next/cache';
import { CreateWalletSchema, CreateWalletPayload } from '@/lib/schemas/wallets';
import { createWallet, archiveWallet, setDefaultWallet } from '@/data/wallets';
import { createClient } from '@/lib/supabase/server';
import { ActionResponse } from '@/types/actions';
import { formatZodErrors } from '@/lib/utils/action-utils';

export async function createWalletAction(payload: CreateWalletPayload): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    const result = CreateWalletSchema.safeParse(payload);
    if (!result.success) {
      return { 
        success: false, 
        message: 'Invalid wallet data', 
        errors: formatZodErrors(result.error) 
      };
    }
    
    await createWallet(user.id, result.data);
    
    revalidatePath('/wallets');
    return { success: true, message: 'Wallet created successfully' };
  } catch (error) {
    console.error('Failed to create wallet:', error);
    return { success: false, message: 'An unexpected error occurred while creating the wallet' };
  }
}

export async function archiveWalletAction(walletId: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    await archiveWallet(user.id, walletId);
    
    revalidatePath('/wallets');
    return { success: true, message: 'Wallet archived successfully' };
  } catch (error) {
    console.error('Failed to archive wallet:', error);
    return { success: false, message: 'Failed to archive wallet' };
  }
}

export async function setDefaultWalletAction(walletId: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    await setDefaultWallet(user.id, walletId);
    
    revalidatePath('/wallets');
    return { success: true, message: 'Default wallet updated' };
  } catch (error) {
    console.error('Failed to set default wallet:', error);
    return { success: false, message: 'Failed to set default wallet' };
  }
}

export async function unarchiveWalletAction(walletId: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    await import('@/data/wallets').then(m => m.unarchiveWallet(user.id, walletId));
    
    revalidatePath('/wallets');
    return { success: true, message: 'Wallet unarchived successfully' };
  } catch (error) {
    console.error('Failed to unarchive wallet:', error);
    return { success: false, message: 'Failed to unarchive wallet' };
  }
}

export async function deleteWalletAction(walletId: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    await import('@/data/wallets').then(m => m.deleteWallet(user.id, walletId));
    
    revalidatePath('/wallets');
    return { success: true, message: 'Wallet deleted successfully' };
  } catch (error) {
    console.error('Failed to delete wallet:', error);
    return { success: false, message: 'Failed to delete wallet' };
  }
}

export async function updateWalletAction(walletId: string, payload: Partial<CreateWalletPayload>): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    await import('@/data/wallets').then(m => m.updateWallet(user.id, walletId, payload));
    
    revalidatePath('/wallets');
    return { success: true, message: 'Wallet updated successfully' };
  } catch (error) {
    console.error('Failed to update wallet:', error);
    return { success: false, message: 'Failed to update wallet' };
  }
}
