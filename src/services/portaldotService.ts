/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ExtrinsicReceipt {
  is_success: boolean;
  status: string;
}

export interface Extrinsic {
  identifier: string;
  weight: number;
  total_fee: number;
  receipt: ExtrinsicReceipt;
  timestamp: number;
}

export interface Block {
  number: number;
  extrinsics: Extrinsic[];
  totalWeight: number;
}

export interface BatchHistory {
  id: string;
  totalWeight: number;
  carbonEstimate: string;
  timestamp: number;
}

class PortaldotSDK {
  private currentBlock = 104230;
  private baseUrl = (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) || 
                   ((import.meta as any).env?.VITE_API_URL) || '';

  constructor() {
    // Start block simulation
    setInterval(() => {
      this.currentBlock++;
    }, 6000); // New block every 6 seconds approx
  }

  private async safeFetch(endpoint: string, options: RequestInit = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          'Accept': 'application/json',
          ...options.headers,
        },
      });

      if (!res.ok) {
        throw new Error(`API_ERROR: ${res.status} ${res.statusText}`);
      }

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API_ERROR: Invalid Content-Type, expected application/json');
      }

      return await res.json();
    } catch (err: any) {
      console.error(`[SDK] Fetch failed for ${endpoint}:`, err.message);
      throw err; // Re-throw to be caught by the hook for Silent Demo switch
    }
  }

  // New FastAPI Wrapper endpoints
  async fetchStats(identifier: string) {
    return this.safeFetch(`/api/stats?identifier=${identifier}`);
  }

  async triggerFlag(target_account: string) {
    return this.safeFetch('/api/trigger-flag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_account })
    });
  }

  getCurrentBlock() {
    return this.currentBlock;
  }

  /**
   * Mock implementation of extrinsic retrieval
   */
  async retrieve_extrinsic_by_identifier(identifier: string): Promise<Extrinsic> {
    // In a real app, this would fetch from a chain state
    return {
      identifier,
      weight: Math.floor(Math.random() * 5000) + 1000,
      total_fee: Math.random() * 0.1 + 0.01,
      receipt: { is_success: true, status: 'SUCCESS' },
      timestamp: Date.now(),
    };
  }

  /**
   * Mock implementation of get_payment_info
   */
  async get_payment_info(call: any): Promise<{ weight: number }> {
    // Simulation
    return {
      weight: call.weight || 2500,
    };
  }

  /**
   * compose_call - pattern specified in docs
   */
  compose_call(module: string, method: string, args: any) {
    return { module, method, args, weight: 1500 };
  }

  /**
   * Multisig extrinsic pattern
   */
  async create_multisig_extrinsic(threshold: number, signers: string[], extrinsic: any) {
    console.log(`Creating multisig for threshold ${threshold} with ${signers.length} signers`);
    return { ...extrinsic, multisig: true, threshold, signers };
  }

  /**
   * Utility batch pattern
   */
  async batch(calls: any[]) {
    return {
      module: 'Utility',
      method: 'batch',
      calls,
      weight: calls.reduce((acc, c) => acc + (c.weight || 0), 0),
    };
  }

  /**
   * Sustainability Logic
   */
  calculateSustainabilityScore(weight: number, fee: number): number {
    if (fee === 0) return 98.4; // Optimized default
    const ratio = weight / (fee * 1000000000); 
    return Math.min(100, Math.max(80, 100 - (1/ratio)));
  }

  /**
   * Connection to the Bridge
   */
  async submitBatch(remarks: string[]) {
    return this.safeFetch('/api/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ remarks })
    });
  }

  async fetchHistory() {
    return this.safeFetch('/api/history');
  }

  async fetchFatigue() {
    return this.safeFetch('/api/fatigue');
  }

  async performAudit(query: string) {
    return this.safeFetch(`/api/audit/${query}`);
  }

  async fetchAttestation(idOrAddress: string) {
    return this.safeFetch(`/api/attestation/${idOrAddress}`);
  }

  async triggerMultisig(call: any) {
    return this.safeFetch('/api/multisig', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ call, threshold: 2 })
    });
  }

  /**
   * --- Civilization Integrations ---
   */

  async fetchCarbonOracle(region: string = 'europe-west2') {
    return this.safeFetch(`/api/carbon-oracle?region=${region}`);
  }

  async fetchRuntimeSeal(address: string) {
    return this.safeFetch(`/api/runtime/seal/${address}`);
  }

  async proposeGovernance(call: any, proposer: string) {
    return this.safeFetch('/api/democracy/propose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ call, proposer })
    });
  }

  async mintSoulbound(recipient: string) {
    return this.safeFetch('/api/mint-soulbound', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient })
    });
  }

  /**
   * WebSocket Listener for Extrinsic Stream
   */
  connectStream(onUpdate: (data: any) => void, onStatusChange?: (status: 'connected' | 'disconnected' | 'syncing') => void) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);
    
    if (onStatusChange) onStatusChange('syncing');

    ws.onopen = () => {
      if (onStatusChange) onStatusChange('connected');
    };

    ws.onclose = () => {
      if (onStatusChange) onStatusChange('disconnected');
    };

    ws.onerror = () => {
      if (onStatusChange) onStatusChange('disconnected');
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'extrinsic_update') {
        onUpdate(msg);
      }
    };

    return () => ws.close();
  }

  /**
   * Subscribe to account balance changes (Mock)
   */
  subscribeBalance(address: string, callback: (balance: number) => void) {
    if (!address) return () => {};
    
    // Initial balance
    let currentBalance = 1042.42 + (Math.random() * 10);
    callback(currentBalance);

    // Simulate occasional incoming rewards or fees
    const interval = setInterval(() => {
      currentBalance += (Math.random() * 0.1) - 0.02;
      callback(currentBalance);
    }, 8000);

    return () => clearInterval(interval);
  }
}

export const portaldot = new PortaldotSDK();
export const Utility = {
  batch: (calls: any[]) => portaldot.batch(calls),
};
