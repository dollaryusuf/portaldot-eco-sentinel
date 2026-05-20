import { useState, useEffect } from 'react';
import { portaldot, BatchHistory } from '../services/portaldotService';

export interface FatigueState {
  fatigue_index: number;
  warning_level: string;
  timestamp: number;
}

export interface OracleState {
  region: string;
  carbon_intensity: number;
  sustainability_score: number;
  status: string;
}

export function useSentinelData() {
  const [history, setHistory] = useState<BatchHistory[]>([]);
  const [fatigue, setFatigue] = useState<FatigueState | null>(null);
  const [oracle, setOracle] = useState<OracleState | null>(null);
  const [liveBlocks, setLiveBlocks] = useState<any[]>([]);
  const [syncStatus, setSyncStatus] = useState<'connected' | 'disconnected' | 'syncing'>('syncing');
  const [apiError, setApiError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Load backend statistics and audits
  const loadStats = async () => {
    try {
      setApiError(null);
      
      // Perform concurrent fetches for main telemetry API routes
      const [histData, fatigueData, oracleData] = await Promise.all([
        portaldot.fetchHistory(),
        portaldot.fetchFatigue(),
        portaldot.fetchCarbonOracle('europe-west2')
      ]);

      setHistory(histData || []);
      setFatigue(fatigueData);
      setOracle(oracleData);
      setIsDemoMode(false);
    } catch (err: any) {
      console.warn('[API] Load stats failed. Switching safely to Demo Mode:', err.message);
      setApiError(`API Unreachable (${err.message}). Activating High-Integrity Local Simulation.`);
      setIsDemoMode(true);
      
      // Seed rich mock telemetry data so user preview is fully responsive and interactive
      setHistory([
        { id: "BATCH_01", totalWeight: 14205000, carbonEstimate: "0.0142", timestamp: Date.now() / 1000 - 3600 },
        { id: "BATCH_02", totalWeight: 8900000, carbonEstimate: "0.0089", timestamp: Date.now() / 1000 - 7200 },
        { id: "BATCH_03", totalWeight: 12100000, carbonEstimate: "0.0121", timestamp: Date.now() / 1000 - 10800 }
      ]);
      setFatigue({
        fatigue_index: 4.8,
        warning_level: "STABLE",
        timestamp: Math.floor(Date.now() / 1000)
      });
      setOracle({
        region: "europe-west2",
        carbon_intensity: 48.2,
        sustainability_score: 97.8,
        status: "METRICS_VERIFIED"
      });
    }
  };

  useEffect(() => {
    loadStats();
    
    // Connect to WebSocket stream for real-time extrinsic logs
    const disconnectStream = portaldot.connectStream(
      (newUpdate) => {
        setLiveBlocks(prev => {
          const combined = [newUpdate.data, ...prev];
          return combined.slice(0, 15); // Maintain the latest 15 transactions
        });
      },
      (newStatus) => {
        setSyncStatus(newStatus);
      }
    );

    // Dynamic incremental mock flow when WebSockets are in simulated mode
    const backupInterval = setInterval(() => {
      if (syncStatus === 'disconnected') {
        const fakeExtrinsic = {
          id: `0x${Math.random().toString(16).substring(2, 10)}...`,
          weight: Math.floor(Math.random() * 12000000) + 3000000,
          fee: parseFloat((Math.random() * 0.15 + 0.02).toFixed(4)),
          status: 'SUCCESS',
          timestamp: Date.now()
        };
        setLiveBlocks(prev => [fakeExtrinsic, ...prev].slice(0, 15));
      }
    }, 7000);

    return () => {
      disconnectStream();
      clearInterval(backupInterval);
    };
  }, [syncStatus]);

  return {
    history,
    setHistory,
    fatigue,
    setFatigue,
    oracle,
    liveBlocks,
    syncStatus,
    apiError,
    isDemoMode,
    refresh: loadStats
  };
}
