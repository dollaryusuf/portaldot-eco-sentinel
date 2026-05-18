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

  constructor() {
    // Start block simulation
    setInterval(() => {
      this.currentBlock++;
    }, 6000); // New block every 6 seconds approx
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
    const res = await fetch('/api/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ remarks })
    });
    return res.json();
  }

  async fetchHistory() {
    const res = await fetch('/api/history');
    return res.json();
  }

  async fetchFatigue() {
    const res = await fetch('/api/fatigue');
    return res.json();
  }

  async performAudit(query: string) {
    const res = await fetch(`/api/audit/${query}`);
    return res.json();
  }

  async fetchAttestation(idOrAddress: string) {
    const res = await fetch(`/api/attestation/${idOrAddress}`);
    return res.json();
  }

  async triggerMultisig(call: any) {
    const res = await fetch('/api/multisig', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ call, threshold: 2 })
    });
    return res.json();
  }

  /**
   * --- Civilization Integrations ---
   */

  async fetchCarbonOracle(region: string = 'europe-west2') {
    const res = await fetch(`/api/carbon-oracle?region=${region}`);
    return res.json();
  }

  async fetchRuntimeSeal(address: string) {
    const res = await fetch(`/api/runtime/seal/${address}`);
    return res.json();
  }

  async proposeGovernance(call: any, proposer: string) {
    const res = await fetch('/api/democracy/propose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ call, proposer })
    });
    return res.json();
  }

  async mintSoulbound(recipient: string) {
    const res = await fetch('/api/mint-soulbound', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient })
    });
    return res.json();
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
