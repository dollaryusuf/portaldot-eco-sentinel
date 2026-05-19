/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;

async function startServer() {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  app.use(express.json());

  // --- Portaldot Logic (The Bridge) ---

  const BATCH_HISTORY: any[] = [
    { id: 'batch_001', totalWeight: 19260, carbonEstimate: '0.019', timestamp: Date.now() - 3600000 },
    { id: 'batch_002', totalWeight: 12840, carbonEstimate: '0.012', timestamp: Date.now() - 7200000 },
  ];

  let fatigueIndex = 4.2;

  const MOCK_EXTRINSICS = [
    { id: '0x089979e1...', weight: 142500000, fee: 0.1, status: 'SUCCESS' },
    { id: '0x24bb91ca...', weight: 245000000, fee: 0.15, status: 'SUCCESS' },
    { id: '0x9e5bd26...', weight: 89000000, fee: 0.05, status: 'SUCCESS' },
    { id: '0x0cc27e54...', weight: 120000000, fee: 0.08, status: 'SUCCESS' },
    { id: '0x7296a445...', weight: 155000000, fee: 0.12, status: 'SUCCESS' },
  ];

  const getCarbonCost = (weight: number) => {
    // Portaldot specific ratio: 1000 weight = 0.001g CO2
    return (weight / 1000) * 0.001;
  };

  app.post('/api/batch', (req, res) => {
    const { remarks } = req.body;
    console.log('[PORTALDOT] Composing Utility.batch for remarks:', remarks);
    
    // Mocking Utility.batch composition
    const totalWeight = remarks.length * 6420;
    const carbon = getCarbonCost(totalWeight);
    const carbonEstimate = carbon.toFixed(5);
    
    const newBatch = {
      id: `batch_${Math.random().toString(16).slice(2, 8)}`,
      totalWeight,
      carbonEstimate,
      timestamp: Date.now()
    };
    
    BATCH_HISTORY.unshift(newBatch);
    
    res.json({
      success: true,
      hash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 10)}`,
      totalWeight,
      carbonEstimate,
      receipt: { is_success: true, status: 'SUCCESS' }
    });
  });

  app.get('/api/history', (req, res) => {
    res.json(BATCH_HISTORY);
  });

  app.get('/api/stats', (req, res) => {
    const { identifier } = req.query;
    console.log(`[ENGINE] Stats requested for ${identifier || '0xDefault'}`);
    res.json({
      carbon_estimator: (0.01 + Math.random() * 0.05).toFixed(4),
      sustainability_score: (94 + Math.random() * 5).toFixed(2),
      compliance: 'PASSED',
      audit_id: `AUDIT_${Date.now()}`,
      timestamp: Date.now()
    });
  });

  app.post('/api/trigger-flag', (req, res) => {
    const { target_account } = req.body;
    console.log(`[MULTISIG] Flag triggered for account: ${target_account}`);
    res.json({
      success: true,
      multisig_id: `0xMS_${Math.floor(Math.random() * 10000)}_SENTINEL`,
      threshold: 2,
      signers: ['Validator_Alpha', 'Validator_Beta', 'Validator_Gamma'],
      status: 'AWAITING_GOVERNANCE',
      proposed_at: Date.now()
    });
  });

  // --- Civilization Integrations ---

  app.get('/api/carbon-oracle', (req, res) => {
    const region = req.query.region || 'europe-west2';
    console.log(`[ORACLE] DePIN Connector: Pinging Energy API for ${region}`);
    
    // Simulate calling the Python script
    // In a real local env: const output = execSync(`python3 DePINOracle.py ${region}`).toString()
    const mockIntensities: Record<string, number> = {
      'europe-west2': 42.5 + Math.random() * 10,
      'us-east-1': 210.4 + Math.random() * 50,
      'asia-east1': 620.1 + Math.random() * 100
    };
    
    const intensity = mockIntensities[region as string] || 150;
    const score = Math.max(0, Math.min(100, 100 - ((intensity - 50) / 7.5)));

    res.json({
      region,
      carbon_intensity: intensity.toFixed(2),
      sustainability_score: score.toFixed(2),
      status: 'VALIDATED',
      oracle_node: 'Sentinel_DePIN_01',
      timestamp: Date.now()
    });
  });

  app.get('/api/runtime/seal/:address', (req, res) => {
    const { address } = req.params;
    console.log(`[RUNTIME] Querying Sustainability Seal for: ${address}`);
    
    res.json({
      success: true,
      data: {
        efficiency_score: 9842 + Math.floor(Math.random() * 150),
        blocks_consistent: 104,
        certification_level: 'ELITE_SENTINEL',
        is_verified: true
      }
    });
  });

  app.post('/api/democracy/propose', (req, res) => {
    const { call, proposer } = req.body;
    console.log(`[GOVERNANCE] Pallet Democracy: Submitting proposal from ${proposer}`);
    
    res.json({
      success: true,
      proposal_id: 142,
      deposit: '10.0 DOT',
      status: 'PROPOSED',
      index: 12
    });
  });

  app.post('/api/mint-soulbound', (req, res) => {
    const { recipient } = req.body;
    console.log(`[INK!] Attestation Contract: Minting Soulbound Badge for ${recipient}`);
    
    res.json({
      success: true,
      nft_id: `SENTINEL_ELITE_${Math.floor(Math.random() * 10000)}`,
      transaction_hash: `0x${Math.random().toString(16).slice(2, 10)}...`,
      metadata: 'ipfs://QmSentinelBadge...'
    });
  });

  app.get('/api/audit/:query', (req, res) => {
    const { query } = req.params;
    console.log(`[PORTALDOT] Historical Auditor: Searching for ${query}`);
    
    // Simulate auditing logic
    res.json({
      success: true,
      query,
      found: true,
      details: {
        type: query.length > 20 || query.startsWith('0x') ? 'Extrinsic' : 'Block',
        weight: Math.floor(Math.random() * 5000000),
        carbonEstimate: (Math.random() * 0.05).toFixed(4),
        status: 'AUDITED',
        timestamp: Date.now() - Math.floor(Math.random() * 1000000)
      }
    });
  });

  app.get('/api/attestation/:address', (req, res) => {
    const { address } = req.params;
    
    // Mock Soulbound check
    const hasCert = address.length > 5 && Math.random() > 0.3; // 70% chance of having a cert for the demo
    
    if (hasCert) {
      res.json({
        exists: true,
        data: {
          efficiency_score: 9942,
          block_height: 104237,
          timestamp: Date.now() - 86400000,
          issuer: '0xSENTINEL_ADMIN'
        }
      });
    } else {
      res.json({ exists: false });
    }
  });

  app.get('/api/fatigue', (req, res) => {
    res.json({
      fatigue_index: fatigueIndex,
      warning_level: fatigueIndex > 15 ? 'CRITICAL' : (fatigueIndex > 8 ? 'WARNING' : 'STABLE'),
      horizon: '10 Blocks'
    });
  });

  app.post('/api/multisig', (req, res) => {
    const { call, threshold } = req.body;
    console.log(`[PORTALDOT] Multisig Coordinator: Preparing call with threshold=${threshold}`);
    
    // Occasionally require more signatures for testing the hook logic
    const required = Math.random() > 0.5 ? 3 : 2;
    
    res.json({
      success: true,
      pending: true,
      required_signatures: required,
      current_signatures: 1,
      multisig_id: '0xMS_9812_Sentinel'
    });
  });

  // --- WebSocket Stream ---
  wss.on('connection', (ws) => {
    console.log('[WS] Client connected to Extrinsic Stream');
    
    const streamInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        const newExt = {
          identifier: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 4)}`,
          weight: Math.floor(Math.random() * 40000) + 20000,
          total_fee: Math.random() * 0.05,
          receipt: {
            is_success: Math.random() > 0.1,
            status: 'SUCCESS' 
          },
          timestamp: Date.now()
        };
        
        fatigueIndex = Math.max(2, Math.min(25, fatigueIndex + (Math.random() * 2 - 0.8)));

        ws.send(JSON.stringify({
          type: 'extrinsic_update',
          data: newExt,
          block: 104237 + Math.floor(Date.now() / 60000)
        }));
      }
    }, 4000);

    ws.on('close', () => clearInterval(streamInterval));
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] Eco-Sentinel active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
