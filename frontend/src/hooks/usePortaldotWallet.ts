import { useState, useEffect } from 'react';

export interface WalletAccount {
  address: string;
  name: string;
  source: string;
}

export function usePortaldotWallet() {
  const [accounts, setAccounts] = useState<WalletAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<WalletAccount | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'Extension' | 'Demo'>('Demo');

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      // Dynamic import to prevent crash on platforms without window context during compilation
      const { web3Enable, web3Accounts } = await import('@polkadot/extension-dapp');
      
      const extensions = await web3Enable('Eco-Sentinel Portaldot');
      if (extensions.length === 0) {
        throw new Error('No Polkadot extensions detected (e.g., SubWallet or Talisman)');
      }

      const allAccounts = await web3Accounts();
      if (allAccounts.length === 0) {
        throw new Error('No authorized accounts found in your extension');
      }

      const formatted = allAccounts.map(acc => ({
        address: acc.address,
        name: acc.meta.name || 'Unnamed',
        source: acc.meta.source,
      }));

      setAccounts(formatted);
      setSelectedAccount(formatted[0]);
      setMode('Extension');
    } catch (err: any) {
      console.warn('[Wallet] Could not connect to Polkadot extension:', err.message);
      
      // Map specific SubWallet / extension blocked errors to highly user-friendly notifications
      if (err.message?.includes('is not allowed to interact') || err.message?.includes('extension')) {
        setError(`SubWallet/Polkadot extension blocked connection for this sandbox domain. Falling back securely to Simulated Web3 Identity.`);
      } else {
        setError(err.message || 'Extension initialization failed');
      }
      
      // Graceful fallback to rich Simulated Web3 Account
      setMode('Demo');
      const mockAcc = {
        address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', // Standard Alice dev address
        name: 'Sentinel_Validator_Alice (Simulated)',
        source: 'Simulated-Engine'
      };
      setAccounts([mockAcc]);
      setSelectedAccount(mockAcc);
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    // Attempt connecting automatically on mount, fallback gracefully on failure
    connectWallet();
  }, []);

  return {
    accounts,
    selectedAccount,
    setSelectedAccount,
    isConnecting,
    error,
    mode,
    reconnect: connectWallet,
  };
}
