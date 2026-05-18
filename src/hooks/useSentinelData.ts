/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { portaldot, type Extrinsic, type BatchHistory } from '../services/portaldotService';

export interface SentinelState {
  currentBlock: number;
  dataFeed: { time: string; weight: number }[];
  recentExtrinsics: Extrinsic[];
  batchHistory: BatchHistory[];
  fatigueData: {
    fatigue_index: number;
    warning_level: string;
  } | null;
  auditResult: any | null;
  attestation: any | null;
  isAuditing: boolean;
  isAlertActive: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'syncing';
  approvalCount: number;
  batchStatus: string | null;
  govStatus: 'IDLE' | 'COMPOSING' | 'SIGNING' | 'SUBMITTED';
  oracleData: {
    region: string;
    carbon_intensity: string;
    sustainability_score: string;
    status: string;
    timestamp: number;
  } | null;
  carbonStats: {
    totalCarbon: string;
    avgSustainability: string;
  };
}

export function useSentinelData() {
  const [currentBlock, setCurrentBlock] = useState(portaldot.getCurrentBlock());
  const [dataFeed, setDataFeed] = useState<{ time: string; weight: number }[]>([]);
  const [recentExtrinsics, setRecentExtrinsics] = useState<Extrinsic[]>([]);
  const [batchHistory, setBatchHistory] = useState<BatchHistory[]>([]);
  const [fatigueData, setFatigueData] = useState<any>(null);
  const [auditResult, setAuditResult] = useState<any>(null);
  const [attestation, setAttestation] = useState<any>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'syncing'>('disconnected');
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [approvalCount, setApprovalCount] = useState(1);
  const [batchStatus, setBatchStatus] = useState<string | null>(null);
  const [govStatus, setGovStatus] = useState<'IDLE' | 'COMPOSING' | 'SIGNING' | 'SUBMITTED'>('IDLE');
  const [oracleData, setOracleData] = useState<any>(null);

  // Initial Data Fetch
  useEffect(() => {
    const init = async () => {
      const history = await portaldot.fetchHistory();
      setBatchHistory(history);
      const fatigue = await portaldot.fetchFatigue();
      setFatigueData(fatigue);
      // Initial attestation lookup for a default validator
      const att = await portaldot.fetchAttestation('validator_01');
      setAttestation(att);
      // Carbon Oracle
      const oracle = await portaldot.fetchCarbonOracle();
      setOracleData(oracle);
    };
    init();
  }, []);

  // WebSocket Listener
  useEffect(() => {
    const disconnect = portaldot.connectStream(
      (msg) => {
        if (msg.type === 'extrinsic_update') {
          const ext = msg.data;
          setRecentExtrinsics(prev => [ext, ...prev.slice(0, 4)]);
          setCurrentBlock(msg.block);
          
          const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          // Scale weight for waveform display
          setDataFeed(prev => [...prev.slice(-19), { time, weight: ext.weight / 1000000 }]);

          // Refresh Fatigue Prediction periodically (every 5 blocks)
          if (msg.block % 5 === 0) {
            portaldot.fetchFatigue().then(setFatigueData);
          }
        }
      },
      (status) => setConnectionStatus(status)
    );

    return () => disconnect();
  }, []);

  const carbonStats = useMemo(() => {
    const lastExt = recentExtrinsics[0];
    // Baseline if no extrinsics yet
    const weight = lastExt ? lastExt.weight : 39000;
    const carbon = (weight / 1000) * 0.001;
    
    return {
      totalCarbon: carbon.toFixed(3), 
      avgSustainability: lastExt 
        ? portaldot.calculateSustainabilityScore(lastExt.weight, lastExt.total_fee).toFixed(1) 
        : "98.4"
    };
  }, [recentExtrinsics]);

  const runAudit = useCallback(async (query: string) => {
    if (!query) return;
    setIsAuditing(true);
    try {
      const result = await portaldot.performAudit(query);
      setAuditResult(result);
      
      // If it looks like an account address, also lookup its attestation
      if (!query.startsWith('0x') && query.length > 5) {
        const att = await portaldot.fetchAttestation(query);
        setAttestation(att);
      }
    } finally {
      setIsAuditing(false);
    }
  }, []);

  const triggerMultisig = useCallback(async (account: any, getSigner: () => Promise<any>) => {
    if (!account) return;
    
    setGovStatus('COMPOSING');
    setIsAlertActive(true);
    setApprovalCount(1);
    
    try {
      // 1. Validator: In a real app, we'd check the on-chain Auditor list
      // For this implementation, we check the metadata role
      const isAuditor = account.meta?.name?.toLowerCase().includes('auditor') || 
                       account.meta?.name?.toLowerCase().includes('sentinel');
      
      console.log(`[AUTH] Checking Auditor Privileges for: ${account.address}`);
      
      if (!isAuditor && account.meta.source !== 'mock') {
        throw new Error('ACCESS_DENIED: Connected account lacks Sentinel Auditor status.');
      }

      await new Promise(resolve => setTimeout(resolve, 1500));
      setGovStatus('SIGNING');

      // 2. Request Signature via Extension
      const signer = await getSigner();
      if (signer) {
        console.log(`[SIGNER] Requesting remote signature from: ${account.meta.source}`);
      }

      const call = portaldot.compose_call('EcoSentinel', 'flag_high_energy', { account: '0xAccount_High_Energy' });
      const response = await portaldot.triggerMultisig(call);
      
      const threshold = response.required_signatures || 2;
      const current = response.current_signatures || 1;
      
      setApprovalCount(current);

      // Helper for sequential aync simulation
      const simulateApprovals = async () => {
        // Automatically 'check' boxes for peers with 1s delay
        for (let next = current + 1; next <= threshold; next++) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          setApprovalCount(next);
        }
        
        // Final delay once threshold is reached
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 3. Governance Pallet Bridge: Submit Proposal
        console.log('[GOVERNANCE] Multisig threshold reached. Bridging to Pallet Democracy...');
        await portaldot.proposeGovernance(call, account.address);

        // SDK Logic: Log to Batch Ledger
        const govEntry: BatchHistory = {
          id: `PROPOSAL_#${Math.floor(Math.random() * 1000)}`,
          timestamp: Date.now(),
          totalWeight: 4500000,
          carbonEstimate: "-15.42", // String as per interface
        };
        setBatchHistory(prev => [govEntry, ...prev]);

        // Finality
        setGovStatus('SUBMITTED');
        
        // Update Oracle: Threat Mitigated (lower intensity, higher score)
        setOracleData((prev: any) => ({
          ...prev,
          carbon_intensity: (parseFloat(prev.carbon_intensity) * 0.8).toFixed(2),
          sustainability_score: Math.min(100, parseFloat(prev.sustainability_score) + 5).toFixed(2)
        }));

        setTimeout(() => {
          setIsAlertActive(false);
          setApprovalCount(1);
          setGovStatus('IDLE');
        }, 4000);
      };

      await simulateApprovals();
    } catch (err: any) {
      console.error('Multisig Error:', err.message);
      alert(err.message);
      setIsAlertActive(false);
      setGovStatus('IDLE');
    }
  }, []);

  const submitBatch = useCallback(async () => {
    setBatchStatus('COMPOSING UTILITY.BATCH...');
    const remarks = ['green-init', 'sust-audit', 'pwr-optim'];
    
    const result = await portaldot.submitBatch(remarks);
    
    // Refresh history
    const updatedHistory = await portaldot.fetchHistory();
    setBatchHistory(updatedHistory);
    
    setTimeout(() => {
      setBatchStatus(`BATCH SUBMITTED: ${result.totalWeight.toLocaleString()} WT`);
      setTimeout(() => setBatchStatus(null), 3000);
    }, 1500);
  }, []);

  const mintBadge = useCallback(async (address: string) => {
    console.log(`[INK!] Requesting Soulbound Badge for ${address}`);
    
    // 1. Check Runtime Seal for eligibility (Efficiency > 98% for 100 blocks)
    const seal = await portaldot.fetchRuntimeSeal(address);
    if (!seal.data.is_verified || seal.data.efficiency_score < 9800 || seal.data.blocks_consistent < 100) {
      alert(`INELIGIBLE: Sustainability Seal requires >98% efficiency for 100 blocks. Current: ${seal.data.efficiency_score/100}%`);
      return;
    }

    const result = await portaldot.mintSoulbound(address);
    // Refresh attestation to reflect new badge
    const att = await portaldot.fetchAttestation(address);
    setAttestation(att);
    return result;
  }, []);

  return {
    state: {
      currentBlock,
      dataFeed,
      recentExtrinsics,
      batchHistory,
      fatigueData,
      auditResult,
      attestation,
      isAuditing,
      connectionStatus,
      isAlertActive,
      approvalCount,
      batchStatus,
      govStatus,
      oracleData,
      carbonStats
    },
    actions: {
      triggerMultisig,
      submitBatch,
      runAudit,
      mintBadge,
      refreshOracle: (region: string) => portaldot.fetchCarbonOracle(region).then(setOracleData)
    }
  };
}
