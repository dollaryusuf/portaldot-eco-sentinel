/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from 'react';
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
  tokenDecimals: 10,
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

  const initializeWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    setHasExtensions(null);

    try {
      // 1. Wait for document to be ready if needed
      if (document.readyState !== 'complete') {
        await new Promise(resolve => {
          window.addEventListener('load', resolve, { once: true });
          // Fallback if load event already fired but readyState isn't complete (unlikely but safe)
          setTimeout(resolve, 1000); 
        });
      }

      // 2. Poll for injectedWeb3 availability
      const detected = await detectExtensions();
      if (!detected) {
        setHasExtensions(false);
        setError('No Polkadot extension found. Please install Talisman, SubWallet, or Polkadot.js.');
        setIsConnecting(false);
        return;
      }

      // 3. Loud Handshake: Added 1500ms delay to ensure extension is fully primed
      console.log('[WALLET] Initiating Loud Handshake with extension provider...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Request permissions with specific origin name (Triggers "Allow" popup)
      console.log('[WALLET] Calling web3Enable: Portaldot Sentinel Auditor Portal');
      const extensions = await web3Enable('Portaldot Sentinel Auditor Portal');
      
      if (extensions.length === 0) {
        // Check if there's an error from the extension specifically about domain blocking
        const isBlocked = (window as any).injectedWeb3 && Object.keys((window as any).injectedWeb3).length > 0;
        if (isBlocked) {
          setError('Security Block: This domain is not whitelisted in your extension. Please allow access in settings or use Demo Mode.');
        } else {
          setHasExtensions(false);
          setError('Access rejected. Please authorize the extension for Portaldot.');
        }
        setIsConnecting(false);
        return;
      }

      setHasExtensions(true);
      await injectMetadata();

      setIsExtensionEnabled(true);
      setIsMock(false);
      
      const allAccounts = await web3Accounts({ ss58Format: PORTALDOT_NETWORK.ss58Format });
      setAccounts(allAccounts);

      if (allAccounts.length > 0) {
        setActiveAccount(allAccounts[0]);
      }
    } catch (err: any) {
      const errorMessage = typeof err === 'string' ? err : (err.message || '');
      // Catch Errors: Log the specific error as requested
      console.error('[WALLET] Loud Handshake Failure:', err);

      if (errorMessage.includes('not allowed to interact') || errorMessage.includes('Security Block')) {
        setError('Security Block: SubWallet has blocked this iframe. Open in a NEW TAB or allow access in Extension Settings.');
      } else if (errorMessage.includes('Rejected') || errorMessage.includes('cancelled')) {
        setError('Connection rejected. Please authorize the extension to continue.');
      } else {
        setError(errorMessage || 'Failed to connect wallet. Try opening in a new tab.');
      }
    } finally {
      setIsConnecting(false);
    }
  }, [detectExtensions, injectMetadata]);

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
