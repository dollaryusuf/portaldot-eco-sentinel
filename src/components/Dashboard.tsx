/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  Activity, 
  CheckCircle2, 
  Clock,
  ShieldAlert,
  Search,
  BadgeCheck,
  Cpu,
  Globe,
  Database,
  Terminal,
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  ResponsiveContainer,
  YAxis,
} from 'recharts';
import { cn } from '../lib/utils';
import { useSentinelData } from '../hooks/useSentinelData';
import { useSentinelIdentity } from '../hooks/useSentinelIdentity';
import { IdentityWidget } from './IdentityWidget';
import { WalletModal } from './WalletModal';

export function Dashboard() {
  const { state, actions } = useSentinelData();
  const { 
    accounts, 
    activeAccount, 
    isConnecting: isWalletConnecting, 
    hasExtensions,
    isMock,
    balance,
    role,
    error: walletError,
    initializeWallet, 
    logout, 
    enableMockMode,
    selectAccount, 
    getSigner 
  } = useSentinelIdentity();

  const [auditQuery, setAuditQuery] = useState('');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const { 
    currentBlock, 
    dataFeed, 
    recentExtrinsics, 
    isAlertActive, 
    approvalCount,
    batchStatus, 
    govStatus,
    carbonStats,
    batchHistory,
    fatigueData,
    auditResult,
    attestation,
    isAuditing,
    oracleData
  } = state;

  return (
    <div className="h-screen w-full bg-black text-white font-sans flex flex-col overflow-hidden selection:bg-emerald selection:text-black">
      
      {/* Portaldot Header Navigation */}
      <nav className="h-20 flex justify-between items-center px-10 border-b border-portaldot shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="portaldot-pulse" />
            <span className="font-mono text-[9px] text-emerald tracking-[0.25em] uppercase font-bold">
              NODE SYNC: #{currentBlock.toLocaleString()}
            </span>
          </div>
          <div className="h-4 w-[1px] bg-white/10" />
          <div className="flex gap-4 font-mono text-[9px] tracking-widest uppercase opacity-40">
            <span>PORTALDOT INFRA</span>
            <span>ECO-SENTINEL v1.0.4</span>
          </div>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
          <h1 className="text-sm font-black tracking-[0.5em] text-white uppercase flex items-center gap-3">
            PORTALDOT <span className="text-emerald">SENTINEL</span>
          </h1>
          <div className="text-[7px] text-emerald/40 tracking-[0.6em] uppercase mt-1">Sustainability Substrate Layer</div>
        </div>

        <div className="flex gap-10 font-mono text-[9px] text-zinc-500 items-center">
          <div className="flex items-center gap-2 group cursor-help transition-colors hover:text-emerald">
            <Globe className="w-3 h-3 opacity-50" />
            <span>RELAY-01: ACTIVE</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="w-3 h-3 opacity-50" />
            <span>99.98% UPTIME</span>
          </div>
          
          <IdentityWidget 
            activeAccount={activeAccount} 
            balance={balance}
            role={role}
            isMock={isMock}
            onOpenModal={() => setIsWalletModalOpen(true)}
            onDisconnect={logout}
          />
        </div>
      </nav>

      {/* Main Dashboard Grid */}
      <main className="flex-1 geometric-grid overflow-hidden">
        
        {/* Left Panel: Deep Audit & Historical Engine */}
        <section className="col-span-3 geometric-panel border-r border-portaldot overflow-y-auto custom-scrollbar">
          <div className="flex flex-col h-full">
            <div className="mb-10">
              <label className="font-mono text-[8px] text-emerald uppercase tracking-[0.4em] mb-3 block opacity-60">System Core</label>
              <h2 className="text-2xl font-light tracking-tight leading-none uppercase">Historical <br /><span className="font-extrabold text-emerald">Auditor</span></h2>
              <p className="mt-4 text-[10px] text-zinc-500 font-mono leading-relaxed uppercase tracking-tighter max-w-[240px]">
                Scanning block heights for anomalous energy consumption and un-taxed weight usage.
              </p>
            </div>
            
            {/* Search Module */}
            <div className="mt-2 relative">
              <div className="absolute inset-0 bg-emerald/5 blur-xl pointer-events-none opacity-20" />
              <input 
                type="text" 
                value={auditQuery}
                onChange={(e) => setAuditQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && actions.runAudit(auditQuery)}
                placeholder="EXTRINSIC IDENTIFIER..."
                className="w-full bg-zinc-900/40 border border-portaldot py-4 pl-12 pr-4 font-mono text-[9px] text-white focus:outline-none focus:border-emerald transition-all placeholder:text-zinc-700 uppercase tracking-widest relative z-10"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald z-20 opacity-60" />
              <button 
                onClick={() => actions.runAudit(auditQuery)}
                disabled={isAuditing}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white text-black px-4 py-1.5 text-[8px] font-black uppercase hover:bg-emerald transition-all disabled:opacity-50 z-20"
              >
                {isAuditing ? "SCANNING" : "AUDIT"}
              </button>
            </div>

            {/* DePIN Oracle Connector UI */}
            {oracleData && (
              <div className="mt-6 p-4 border border-[#1A1A1A] bg-black relative group">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-yellow-500" />
                    <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-[0.2em]">DePIN Oracle Feed</span>
                  </div>
                  <div className="px-1.5 py-0.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-[6px] font-mono uppercase tracking-[0.1em] animate-pulse">
                    Live
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[7px] text-zinc-600 uppercase tracking-widest mb-1">Grid Intensity</div>
                    <div className="text-[12px] font-mono font-bold text-white uppercase">{oracleData.carbon_intensity} <span className="text-[7px] opacity-40">gCO2/kWh</span></div>
                  </div>
                  <div className="text-right">
                    <div className="text-[7px] text-zinc-600 uppercase tracking-widest mb-1">Stability Score</div>
                    <div className="text-[12px] font-mono font-bold text-emerald">{oracleData.sustainability_score}/100</div>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[7px] text-zinc-700 font-mono uppercase tracking-[0.05em]">Region: {oracleData.region} // Node: {oracleData.oracle_node}</span>
                  <button 
                    onClick={() => actions.refreshOracle('europe-west2')}
                    className="text-[7px] text-emerald hover:underline font-bold uppercase"
                  >
                    Sync
                  </button>
                </div>
              </div>
            )}

            {/* Result Display */}
            <div className="mt-8 flex-1">
              {auditResult ? (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="border border-portaldot p-5 bg-zinc-900/20 relative group"
                >
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[8px] font-mono text-emerald/60 uppercase tracking-widest">Audit Record // {auditResult.details.type}</span>
                    <Terminal className="w-3 h-3 text-emerald opacity-20 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <div className="font-mono space-y-4">
                    <div className="text-[10px] text-white break-all leading-tight border-b border-portaldot pb-4 mb-4">
                      {auditResult.query}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[7px] text-zinc-600 uppercase tracking-widest mb-1">Weight Value</div>
                        <div className="text-[11px] text-white">{auditResult.details.weight.toLocaleString()} WT</div>
                      </div>
                      <div>
                        <div className="text-[7px] text-zinc-600 uppercase tracking-widest mb-1">Carbon Impact</div>
                        <div className="text-[11px] text-emerald">{auditResult.details.carbonEstimate}g CO2</div>
                      </div>
                    </div>
                    <div className="pt-2">
                       <span className="text-[9px] px-2 py-0.5 bg-emerald/10 text-emerald font-bold border border-emerald/30 group-hover:bg-emerald group-hover:text-black transition-colors uppercase">
                         STATUS: {auditResult.details.status}
                       </span>
                    </div>
                  </div>

                  {attestation?.exists && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="mt-6 pt-6 border-t border-portaldot flex items-center gap-4"
                    >
                      <div className="w-10 h-10 border border-emerald/30 bg-emerald/5 flex items-center justify-center shrink-0">
                        <BadgeCheck className="w-5 h-5 text-emerald" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-emerald uppercase tracking-[0.1em]">Green Attestation</span>
                        <span className="text-[7px] text-zinc-500 font-mono mt-0.5">SOULBOUND TOKEN: #XF-{Math.floor(Math.random() * 9999)}</span>
                        <span className="text-[9px] text-zinc-300 font-mono mt-1 italic">Efficiency: {attestation.data.efficiency_score / 100}%</span>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <div className="h-full border border-dashed border-portaldot flex flex-col items-center justify-center p-10 text-center opacity-20">
                  <Activity className="w-8 h-8 mb-4 " />
                  <span className="text-[9px] font-mono uppercase tracking-[0.3em]">Awaiting Audit <br />Query Stream</span>
                </div>
              )}
            </div>

            {/* Carbon Footer Module */}
            <div className="mt-8 border-t border-portaldot pt-8">
               <div className="flex justify-between items-center mb-6">
                 <div className="flex flex-col">
                   <span className="text-[8px] text-emerald/60 uppercase font-mono tracking-widest mb-1 underline decoration-emerald/20">Metric: Carbon Cost</span>
                   <div className="flex items-baseline gap-2">
                     <span className="text-4xl font-bold tracking-tight leading-none">{carbonStats.totalCarbon}</span>
                     <span className="text-emerald text-[9px] font-black tracking-widest">G CO2</span>
                   </div>
                 </div>
                 <div className="text-right">
                    <span className="text-[8px] text-zinc-600 block uppercase font-mono tracking-widest mb-1 underline decoration-zinc-800">Efficiency</span>
                    <span className="text-xl font-bold text-white">{carbonStats.avgSustainability}%</span>
                 </div>
               </div>
               <div className="w-full h-[2px] bg-zinc-900 overflow-hidden relative">
                  <motion.div 
                    key={carbonStats.avgSustainability}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: carbonStats.avgSustainability / 100 }}
                    className="h-full bg-emerald origin-left absolute inset-0 glow-emerald"
                  />
               </div>
               <p className="text-[7.5px] text-zinc-600 mt-4 font-mono leading-relaxed uppercase tracking-tighter opacity-80">
                  Real-time infrastructure calculation based on 1M weight = 0.001g CO2 standardized emission protocols.
               </p>
            </div>
          </div>
        </section>

        {/* Center Panel: Live Stream & Stress Test */}
        <section className="col-span-6 geometric-panel border-r border-portaldot flex flex-col p-0">
          
          {/* Waveform Section */}
          <div className="p-8 border-b border-portaldot h-[40%] flex flex-col">
            <div className="flex justify-between items-start mb-8">
              <div>
                <label className="font-mono text-[8px] text-emerald uppercase tracking-[0.4em] mb-2 block opacity-60">Real-time Feed</label>
                <h2 className="text-2xl font-light tracking-tight leading-none uppercase">Network <br /><span className="font-extrabold text-white">Waveform</span></h2>
              </div>
              <div className="flex flex-col items-end">
                 <div className="flex items-center gap-2 mb-2 bg-emerald/5 border border-emerald/20 px-3 py-1">
                   <div className="portaldot-pulse" />
                   <span className="text-[8px] font-mono text-emerald font-bold tracking-[0.2em] uppercase">LINK ACTIVE</span>
                 </div>
                 <span className="text-[7px] text-zinc-700 font-mono text-right tracking-widest uppercase">Sampling Block Weight (WT)</span>
              </div>
            </div>

            <div className="flex-1 w-full pointer-events-none relative">
              <div className="absolute inset-0 grid grid-cols-12 gap-px pointer-events-none opacity-5">
                 {Array.from({ length: 12 }).map((_, i) => <div key={i} className="border-l border-white/20 h-full" />)}
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dataFeed}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00FF9D" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00FF9D" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#00FF9D" 
                    strokeWidth={2}
                    fill="url(#colorWeight)" 
                    isAnimationActive={false}
                  />
                  <YAxis hide domain={[0, 250]} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Batcher & Stress Test Section */}
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar flex flex-col">
            <div className="mb-8">
              <label className="font-mono text-[8px] text-emerald uppercase tracking-[0.4em] mb-2 block opacity-60">SDK Operations</label>
              <h2 className="text-2xl font-light tracking-tight leading-none uppercase">Fatigue <br /><span className="font-extrabold text-white">Stress Test</span></h2>
            </div>

            {/* Fatigue Warning from Python Engine */}
            {fatigueData && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "mb-8 p-5 border border-portaldot relative overflow-hidden flex items-center justify-between",
                  fatigueData.warning_level === 'CRITICAL' ? "bg-red-500/5 border-red-500/20" : 
                  fatigueData.warning_level === 'WARNING' ? "bg-yellow-500/5 border-yellow-500/20" : 
                  "bg-emerald/5 border-emerald/10"
                )}
              >
                <div className="flex items-center gap-4 z-10">
                   <div className={cn(
                     "w-10 h-10 flex items-center justify-center border",
                     fatigueData.warning_level === 'CRITICAL' ? "border-red-500/30 text-red-500 bg-red-500/10 animate-pulse" : 
                     fatigueData.warning_level === 'WARNING' ? "border-yellow-500/30 text-yellow-500 bg-yellow-500/10" : 
                     "border-emerald/30 text-emerald bg-emerald/10"
                   )}>
                     <ShieldAlert className="w-5 h-5" />
                   </div>
                   <div>
                     <div className="text-[10px] font-black uppercase tracking-widest text-zinc-100">
                       Predicted Fatigue (+10 Blocks)
                     </div>
                     <div className={cn(
                       "text-[8px] font-mono uppercase tracking-tighter mt-1",
                       fatigueData.warning_level === 'CRITICAL' ? "text-red-500" : 
                       fatigueData.warning_level === 'WARNING' ? "text-yellow-500" : "text-emerald"
                     )}>
                       Current Prediction Engine: Linear Regression v2.0
                     </div>
                   </div>
                </div>
                <div className="text-right z-10">
                  <div className={cn(
                    "text-3xl font-bold tracking-tighter mb-1",
                    fatigueData.warning_level === 'CRITICAL' ? "text-red-500" : 
                    fatigueData.warning_level === 'WARNING' ? "text-yellow-500" : "text-emerald"
                  )}>
                    +{fatigueData.fatigue_index}%
                  </div>
                  <div className="text-[7px] text-zinc-600 font-mono uppercase tracking-widest">{fatigueData.warning_level} PHASE</div>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-2 gap-6 mb-10">
               <div className="border border-portaldot p-6 bg-zinc-900/10 group cursor-default hover:bg-emerald/5 transition-colors">
                  <div className="text-[8px] text-zinc-600 font-mono uppercase tracking-widest mb-4 flex justify-between">
                    <span>Batch Queue</span>
                    <Cpu className="w-3 h-3 opacity-20" />
                  </div>
                  <div className="space-y-3">
                     {[1,2,3].map(i => (
                       <div key={i} className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 bg-emerald opacity-20 rounded-full" />
                          <div className="text-[9px] font-mono text-zinc-400">utility.compose_call("probe_{i}")</div>
                       </div>
                     ))}
                  </div>
               </div>
               <div className="border border-portaldot p-6 bg-zinc-900/10 hover:bg-emerald/5 transition-colors">
                  <div className="text-[8px] text-zinc-600 font-mono uppercase tracking-widest mb-4">Batch Metrics</div>
                  <div className="space-y-4">
                    <div>
                       <div className="text-[11px] font-mono text-white tracking-tighter uppercase whitespace-nowrap">Weight: 6.42M WT</div>
                       <div className="w-full h-[1px] bg-portaldot border-b border-white/5 my-1" />
                    </div>
                    <div>
                       <div className="text-[11px] font-mono text-emerald tracking-tighter uppercase whitespace-nowrap">CO2: 0.0064 G</div>
                       <div className="w-full h-[1px] bg-portaldot border-b border-white/5 my-1" />
                    </div>
                  </div>
               </div>
            </div>

            <button 
              onClick={actions.submitBatch}
              disabled={!!batchStatus && batchStatus.startsWith('COMPOSING')}
              className="w-full py-5 bg-emerald text-black font-black uppercase text-[10px] tracking-[0.4em] hover:scale-[1.01] transition-all hover:glow-emerald active:scale-95 disabled:opacity-50 relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
              {batchStatus && batchStatus.startsWith('COMPOSING') ? "INJECTING_BATCH..." : "EXECUTE GREEN_BATCH"}
            </button>
          </div>
        </section>

        {/* Right Panel: Active Governance & Alert Stream */}
        <section className="col-span-3 geometric-panel bg-[#050505] overflow-y-auto custom-scrollbar">
          <div className="mb-10">
            <label className="font-mono text-[8px] text-emerald uppercase tracking-[0.4em] mb-3 block opacity-60">Governance Layer</label>
            <h2 className="text-2xl font-light tracking-tight leading-none uppercase">Sentinel <br /><span className="font-extrabold text-white">Approvals</span></h2>
          </div>

          <div className={cn(
            "p-5 mb-10 border transition-all duration-700 relative overflow-hidden",
            isAlertActive ? "border-red-500/50 bg-red-500/5 ring-1 ring-red-500/20" : "border-portaldot"
          )}>
            {isAlertActive && <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 animate-ping m-3 rounded-full" />}
            <div className={cn(
              "font-mono text-[8px] font-black mb-4 tracking-[0.3em] uppercase",
              isAlertActive ? "text-red-500" : "text-zinc-600"
            )}>
              {isAlertActive ? ">> CRITICAL_ALARM_ACTIVE" : "// SENTINEL_IDLE"}
            </div>
            
            <div className="space-y-4 font-mono">
              <div className="flex flex-col">
                 <span className="text-[7px] text-zinc-600 uppercase tracking-widest mb-1">Target Account</span>
                 <span className="text-[10px] text-white break-all leading-tight tracking-tight">
                    {isAlertActive ? "0xEco_Sentinel_High_Usage_Violation_912" : "NO_CURRENT_VIOLATIONS"}
                 </span>
              </div>
              <div className="flex justify-between items-end border-t border-portaldot pt-4">
                 <div className="flex flex-col">
                    <span className="text-[7px] text-zinc-600 uppercase tracking-widest mb-1">Energy Ratio</span>
                    <span className={cn("text-lg font-bold", isAlertActive ? "text-red-500" : "text-emerald")}>
                      {isAlertActive ? ">450%" : "23%"}
                    </span>
                 </div>
                 <div className="text-right">
                    <span className="text-[7px] text-zinc-600 uppercase tracking-widest mb-1">Required</span>
                    <span className="text-lg font-bold text-white">{approvalCount}/3 SIGS</span>
                 </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 flex-1 flex flex-col">
            <div className="space-y-4">
              {[
                { name: 'AUDITOR_ALICE (SENTINEL_01)', active: true },
                { name: 'AUDITOR_BOB (SENTINEL_02)', active: approvalCount >= 2 },
                { name: 'AUDITOR_CHARLIE (SENTINEL_03)', active: approvalCount >= 3 }
              ].map((auditor, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className={cn(
                    "w-5 h-5 flex items-center justify-center border transition-all duration-500",
                    auditor.active ? "bg-emerald border-emerald text-black glow-emerald" : "border-portaldot text-zinc-800"
                  )}>
                    {auditor.active && <CheckCircle2 className="w-3 h-3" />}
                  </div>
                  <div className={cn(
                    "text-[8px] font-mono tracking-widest uppercase transition-colors",
                    auditor.active ? "text-zinc-200" : "text-zinc-700"
                  )}>
                    {auditor.name}
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={activeAccount ? () => actions.triggerMultisig(activeAccount, getSigner) : () => setIsWalletModalOpen(true)}
              disabled={govStatus !== 'IDLE'}
              className={cn(
                "w-full py-4 mt-4 bg-transparent border border-emerald/40 text-emerald font-black uppercase text-[9px] tracking-[0.4em] transition-all hover:border-emerald active:scale-95",
                govStatus === 'IDLE' && !activeAccount && "animate-pulse border-emerald/60 shadow-[0_0_15px_rgba(0,255,157,0.1)] hover:bg-emerald hover:text-black",
                govStatus === 'IDLE' && activeAccount && "hover:bg-emerald hover:text-black",
                govStatus === 'COMPOSING' && "bg-zinc-800 text-zinc-400 border-zinc-700 cursor-wait",
                govStatus === 'SIGNING' && "bg-red-500/10 border-red-500/40 text-red-500 cursor-wait shadow-[0_0_20px_rgba(239,68,68,0.1)]",
                govStatus === 'SUBMITTED' && "bg-emerald border-emerald text-black shadow-[0_0_30px_rgba(0,255,157,0.4)] animate-none"
              )}
            >
              {!activeAccount ? "CONNECT IDENTITY TO FLAG" : 
               govStatus === 'COMPOSING' ? "COMPOSING MULTISIG..." : 
               govStatus === 'SIGNING' ? "AWAITING_GOVERNANCE_SIGS" : 
               govStatus === 'SUBMITTED' ? "PROPOSAL SUBMITTED" : "TRIGGER FLAG_CALL"}
            </button>

            {/* Soulbound Attestation Call UI */}
            {activeAccount && !attestation?.exists && (
              <div className="mt-4 p-4 border border-dashed border-[#1A1A1A] bg-zinc-900/5 group">
                <div className="flex items-center gap-3 mb-2">
                  <BadgeCheck className="w-3 h-3 text-zinc-700 group-hover:text-emerald transition-colors" />
                  <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest group-hover:text-zinc-300">Identity Attestation Pending</span>
                </div>
                <button 
                  onClick={() => actions.mintBadge(activeAccount.address)}
                  className="w-full py-2 border border-zinc-800 text-zinc-600 font-bold uppercase text-[8px] tracking-widest hover:border-emerald hover:text-emerald transition-all"
                >
                  Mint Soulbound Badge (ink!)
                </button>
              </div>
            )}

            {/* Batch History in Sub-Panel */}
            <div className="mt-10 border-t border-portaldot pt-8 flex-1 flex flex-col min-h-0">
               <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-2">
                   <Clock className="w-3 h-3 text-emerald opacity-50" />
                   <span className="text-[8px] text-zinc-500 font-mono tracking-widest uppercase">Batch Ledger</span>
                 </div>
                 <span className="text-[7px] text-zinc-700 font-mono uppercase tracking-[0.3em]">Last 10 Actions</span>
               </div>

               <div className="space-y-5 overflow-y-auto custom-scrollbar pr-4 flex-1">
                 {batchHistory.map(batch => (
                   <div key={batch.id} className="group border-l-[1px] border-portaldot pl-4 py-1 hover:border-emerald/50 transition-colors">
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest group-hover:text-emerald transition-colors">{batch.id}</span>
                         <span className="text-[9px] font-mono text-emerald/80 italic font-bold">+{batch.carbonEstimate} G</span>
                      </div>
                      <div className="text-[9px] font-mono text-zinc-400 uppercase tracking-tighter opacity-80 border-b border-portaldot pb-1">
                        Injected {batch.totalWeight.toLocaleString()} WT Payload
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
          
          <div className="mt-8 border border-dashed border-portaldot p-5 opacity-40 hover:opacity-100 transition-opacity">
             <div className="text-[7px] font-mono text-zinc-500 text-center uppercase tracking-[0.2em] mb-2 leading-relaxed">
               Secure Sentinel Protocol v1.42 <br />
               Encrypted Subscription Active
             </div>
             <div className="flex justify-center text-[8px] font-black text-emerald uppercase tracking-[0.4em] animate-pulse">
               &lt; ALL SYSTEMS STABLE &gt;
             </div>
          </div>
        </section>
      </main>

      {/* Global Status Footer */}
      <footer className="h-10 bg-[#0A0A0A] border-t border-portaldot flex items-center px-10 justify-between shrink-0 font-mono">
         <div className="flex gap-10 text-[8px] tracking-[0.2em] uppercase text-zinc-500 items-center">
            <div className="flex items-center gap-2">
              <div className="w-1 h-3 bg-emerald/20" />
              <span>SUBSCRIPTION: WS_LIVE_STREAM</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-3 bg-emerald/20" />
              <span>BLOCK_TIME: 104237.4ms</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-3 bg-emerald/20" />
              <span>ENCODING: SCALE (v4)</span>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <span className="text-[8px] text-emerald font-black tracking-[0.4em] uppercase italic">
               Trusted Civilization Infrastructure
            </span>
            <div className="w-2 h-2 rounded-full border border-emerald/20 flex items-center justify-center p-[2px]">
               <div className="w-full h-full bg-emerald animate-pulse rounded-full" />
            </div>
         </div>
      </footer>

      <WalletModal 
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        accounts={accounts}
        activeAccount={activeAccount}
        onSelectAccount={selectAccount}
        onConnect={initializeWallet}
        isConnecting={isWalletConnecting}
        error={walletError}
        hasExtensions={hasExtensions}
        enableMockMode={enableMockMode}
      />
    </div>
  );
}
