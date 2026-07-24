'use server';

import { archiveWallet, createWallet, setDefaultWallet } from '@/features/wallets/queries';
import { CreateWalletPayload, CreateWalletSchema, UpdateWalletPayload, UpdateWalletSchema } from '@/features/wallets/schemas';
import { executeAction, executeValidatedAction } from '@/lib/utils/action-utils';
import { ActionResponse } from '@/types/actions';
import { revalidatePath, updateTag } from 'next/cache';

export async function createWalletAction(payload: CreateWalletPayload): Promise<ActionResponse> {
  return executeValidatedAction(CreateWalletSchema, payload, async (user, data) => {
    await createWallet(user.id, data);
    
    updateTag(`wallets-${user.id}`);
    revalidatePath('/wallets');
    updateTag(`archived-wallets-${user.id}`);
    return { success: true, message: 'Wallet created successfully' };
  });
}

export async function archiveWalletAction(walletId: string): Promise<ActionResponse> {
  return executeAction(async (user) => {
    await archiveWallet(user.id, walletId);
    
    updateTag(`wallets-${user.id}`);
    revalidatePath('/wallets');
    updateTag(`archived-wallets-${user.id}`);
    return { success: true, message: 'Wallet archived successfully' };
  });
}

export async function setDefaultWalletAction(walletId: string): Promise<ActionResponse> {
  return executeAction(async (user) => {
    await setDefaultWallet(user.id, walletId);
    
    updateTag(`wallets-${user.id}`);
    revalidatePath('/wallets');
    return { success: true, message: 'Default wallet updated' };
  });
}

export async function unarchiveWalletAction(walletId: string): Promise<ActionResponse> {
  return executeAction(async (user) => {
    await import('@/features/wallets/queries').then(m => m.unarchiveWallet(user.id, walletId));
    
    updateTag(`wallets-${user.id}`);
    revalidatePath('/wallets');
    updateTag(`archived-wallets-${user.id}`);
    return { success: true, message: 'Wallet unarchived successfully' };
  });
}

export async function deleteWalletAction(walletId: string): Promise<ActionResponse> {
  return executeAction(async (user) => {
    await import('@/features/wallets/queries').then(m => m.deleteWallet(user.id, walletId));
    
    updateTag(`wallets-${user.id}`);
    revalidatePath('/wallets');
    updateTag(`archived-wallets-${user.id}`);
    return { success: true, message: 'Wallet deleted successfully' };
  });
}

export async function updateWalletAction(walletId: string, payload: UpdateWalletPayload): Promise<ActionResponse> {
  return executeValidatedAction(UpdateWalletSchema, payload, async (user, data) => {
    await import('@/features/wallets/queries').then(m => m.updateWallet(user.id, walletId, data));
    
    updateTag(`wallets-${user.id}`);
    revalidatePath('/wallets');
    updateTag(`archived-wallets-${user.id}`);
    return { success: true, message: 'Wallet updated successfully' };
  });
}
