/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePortaldotWallet } from './usePortaldotWallet';
import { portaldot } from '../services/portaldotService';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

const STORAGE_KEY = 'portaldot_sentinel_identity';

export function useSentinelIdentity() {
  const wallet = usePortaldotWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const initialized = useRef(false);

  // 1. Persistence & Auto-Connect
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const savedAddress = localStorage.getItem(STORAGE_KEY);
    if (savedAddress && !wallet.activeAccount) {
      console.log(`[IDENTITY] Found saved identity: ${savedAddress}. Attempting auto-connect...`);
      wallet.initializeWallet().then(() => {
        // We'll handle selecting the specific account in the next effect
      });
    }
  }, [wallet.initializeWallet, wallet.activeAccount]);

  // 2. Select saved account once accounts are loaded
  useEffect(() => {
    const savedAddress = localStorage.getItem(STORAGE_KEY);
    if (savedAddress && wallet.accounts.length > 0 && !wallet.activeAccount) {
      const match = wallet.accounts.find(a => a.address === savedAddress);
      if (match) {
        wallet.selectAccount(match);
      }
    }
  }, [wallet.accounts, wallet.activeAccount, wallet.selectAccount]);

  // 3. Update localStorage when activeAccount changes
  useEffect(() => {
    if (wallet.activeAccount) {
      localStorage.setItem(STORAGE_KEY, wallet.activeAccount.address);
    } else if (wallet.isExtensionEnabled && !wallet.isConnecting && !wallet.activeAccount) {
      // Don't clear if we are still initializing or if mock mode is being toggled
      // Only clear if explicitly disconnected
    }
  }, [wallet.activeAccount, wallet.isExtensionEnabled, wallet.isConnecting]);

  // Handle explicit disconnect to clear storage
  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    wallet.disconnect();
    setBalance(null);
  }, [wallet.disconnect]);

  // 4. Live Balance Subscription
  useEffect(() => {
    if (!wallet.activeAccount) {
      setBalance(null);
      return;
    }

    const unsubscribe = portaldot.subscribeBalance(wallet.activeAccount.address, (newBalance) => {
      setBalance(newBalance);
    });

    return () => unsubscribe();
  }, [wallet.activeAccount]);

  return {
    ...wallet,
    balance,
    error: wallet.error,
    logout,
    // Add role calculation helper
    role: wallet.activeAccount?.meta?.name?.toLowerCase().includes('auditor') || 
          wallet.activeAccount?.meta?.name?.toLowerCase().includes('sentinel') 
          ? 'Sentinel Auditor' 
          : 'Network Entity'
  };
}
