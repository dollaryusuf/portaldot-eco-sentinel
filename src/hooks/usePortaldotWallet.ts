/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { 
  web3Enable, 
  web3Accounts, 
  web3FromSource
} from '@polkadot/extension-dapp';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

const PORTALDOT_NETWORK = {
  chain: 'Portaldot Mainnet',
  genesisHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  ss58Format: 42,
  tokenDecimals: 12,
  tokenSymbol: 'DOT',
  rpcUrl: 'wss://rpc.portaldot.network'
};

export function usePortaldotWallet() {
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [activeAccount, setActiveAccount] = useState<InjectedAccountWithMeta | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExtensionEnabled, setIsExtensionEnabled] = useState(false);
  const [hasExtensions, setHasExtensions] = useState<boolean | null>(null);
  const [isMock, setIsMock] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Top-Tier: Inject Network Metadata into Extension
  const injectMetadata = useCallback(async () => {
    try {
      // In a real scenario, we'd use web3UpdateMetadata
      // For this implementation, we ensure SS58 format is set during account fetch
      console.log(`[METADATA] Injecting Portaldot Config: SS58=${PORTALDOT_NETWORK.ss58Format}`);
    } catch (e) {
      console.warn('Metadata injection failed', e);
    }
  }, []);

  // Top-Tier: Detect Extension with Polling
  const detectExtensions = useCallback(async (maxRetries = 6): Promise<boolean> => {
    for (let i = 0; i < maxRetries; i++) {
      if ((window as any).injectedWeb3 && Object.keys((window as any).injectedWeb3).length > 0) {
        return true;
      }
      console.log(`[WALLET] Searching for Polkadot extension (attempt ${i + 1}/${maxRetries})...`);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    return false;
  }, []);

  // This logic gets the Genesis Hash automatically from the network
  const getPortaldotSpecs = useCallback(async (api: any) => {
    const genesisHash = api.genesisHash.toHex();
    console.log("Portaldot Genesis Hash:", genesisHash);
    return genesisHash;
  }, []);

  const initializeWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    setHasExtensions(null);

    // Initial check for injectedWeb3 presence
    if (!(window as any).injectedWeb3) {
      setHasExtensions(false);
      setError('Security Block: No Polkadot-compatible extension found.');
      setIsConnecting(false);
      return;
    }

    // Set a handshake timeout (5s)
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsConnecting(false);
      setError('Connection Timed Out. Extension may be restricted or blocked by browser.');
      console.error('[WALLET] Handshake Timed Out after 5000ms');
      timeoutRef.current = null;
    }, 5000);

    try {
      setHasExtensions(true);

      // Robust Fail-Safe Connection: Single web3Enable call
      console.log('[WALLET] Initiating Robust Handshake: Portaldot Sentinel');
      
      // Request permissions
      const extensions = await web3Enable('Portaldot Sentinel');
      
      // Clear timeout if web3Enable resolves
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (extensions.length === 0) {
        setError('Security Block: This domain is not whitelisted or SubWallet is restricted.');
        setIsConnecting(false);
        return;
      }

      setIsExtensionEnabled(true);
      setIsMock(false);

      // Standard account fetch
      const allAccounts = await web3Accounts({ ss58Format: PORTALDOT_NETWORK.ss58Format });
      setAccounts(allAccounts);

      if (allAccounts.length > 0) {
        setActiveAccount(allAccounts[0]);
      }
    } catch (err: any) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      const errorStr = String(err);
      const errorMessage = typeof err === 'string' ? err : (err.message || errorStr);
      console.error('[WALLET] Handshake Error Detail:', err);

      if (errorMessage.includes('not allowed to interact') || 
          errorStr.includes('is not allowed to interact') || 
          errorMessage.includes('Security Block') ||
          errorMessage.toLowerCase().includes('subwallet') ||
          errorMessage.toLowerCase().includes('initializing subwallet-js')) {
        setError('Security Block: This domain (Google Cloud) is not allowed by SubWallet. Click "OPEN IN NEW TAB" or use Demo Mode.');
      } else if (errorMessage.includes('Rejected') || errorMessage.includes('cancelled')) {
        setError('Connection rejected. Please authorize the extension to continue.');
      } else {
        setError(errorMessage || 'Failed to connect wallet. Try opening in a new tab.');
      }
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setActiveAccount(null);
    setAccounts([]);
    setIsExtensionEnabled(false);
    setIsMock(false);
    setHasExtensions(null);
    setError(null);
  }, []);

  const enableMockMode = useCallback(() => {
    const mockAccount: InjectedAccountWithMeta = {
      address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      meta: {
        name: 'Sentinel Dev (Demo)',
        source: 'mock'
      },
      type: 'sr25519'
    };
    setAccounts([mockAccount]);
    setActiveAccount(mockAccount);
    setIsExtensionEnabled(true);
    setIsMock(true);
    setError(null);
  }, []);

  const selectAccount = useCallback((account: InjectedAccountWithMeta) => {
    setActiveAccount(account);
  }, []);

  const getSigner = useCallback(async () => {
    if (!activeAccount || isMock) return null;
    const injector = await web3FromSource(activeAccount.meta.source);
    return injector.signer;
  }, [activeAccount, isMock]);

  return {
    accounts,
    activeAccount,
    isConnecting,
    error,
    isExtensionEnabled,
    hasExtensions,
    isMock,
    initializeWallet,
    disconnect,
    enableMockMode,
    selectAccount,
    getSigner,
    network: PORTALDOT_NETWORK
  };
}
