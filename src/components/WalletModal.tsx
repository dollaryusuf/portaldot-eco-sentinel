/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { X, Wallet, ShieldCheck, ArrowRight } from 'lucide-react';
import Identicon from '@polkadot/react-identicon';
import { cn } from '../lib/utils';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: InjectedAccountWithMeta[];
  activeAccount: InjectedAccountWithMeta | null;
  onSelectAccount: (account: InjectedAccountWithMeta) => void;
  onConnect: () => void;
  isConnecting: boolean;
  error: string | null;
  hasExtensions: boolean | null;
  enableMockMode: () => void;
}

export function WalletModal({ 
  isOpen, 
  onClose, 
  accounts, 
  activeAccount, 
  onSelectAccount,
  onConnect,
  isConnecting,
  error,
  hasExtensions,
  enableMockMode
}: WalletModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-black border border-[#1A1A1A] p-8 shadow-2xl shadow-emerald/5"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-zinc-700 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-6 bg-emerald" />
                <h2 className="text-xl font-bold tracking-tight uppercase">Trusted Discovery</h2>
              </div>
              <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-[0.2em]">
                Authenticating Sentinel Authority Level 4
              </p>
            </div>

               <div className="space-y-4">
                 {error && (
                   <div className="p-3 border border-red-500/30 bg-red-500/5 text-red-500 text-[9px] font-mono uppercase tracking-widest text-center animate-pulse">
                     {error}
                   </div>
                 )}
                 {error?.includes('Security Block') && (
                   <div className="space-y-2">
                     <button
                       onClick={() => window.open(window.location.href, '_blank')}
                       className="w-full py-4 bg-white text-black font-black uppercase text-[9px] tracking-[0.2em] hover:bg-zinc-200 transition-all"
                     >
                       OPEN IN NEW TAB (FIX)
                     </button>
                     <button
                       onClick={enableMockMode}
                       className="w-full py-4 bg-emerald/10 border border-emerald/40 text-emerald font-black uppercase text-[9px] tracking-[0.2em] hover:bg-emerald hover:text-black transition-all"
                     >
                       BYPASS VIA DEMO MODE
                     </button>
                   </div>
                 )}
                 {accounts.length > 0 ? (
                <div className="space-y-2">
                  <label className="text-[8px] text-zinc-700 font-mono uppercase tracking-[0.3em] mb-3 block">Authorized Identifiers</label>
                  {accounts.map((account) => {
                    const isActive = activeAccount?.address === account.address;
                    return (
                      <button
                        key={account.address}
                        onClick={() => {
                          onSelectAccount(account);
                          onClose();
                        }}
                        className={cn(
                          "w-full p-4 flex items-center justify-between border transition-all group relative overflow-hidden",
                          isActive 
                            ? "bg-emerald/5 border-emerald" 
                            : "bg-[#050505] border-[#1A1A1A] hover:border-zinc-700"
                        )}
                      >
                        {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald shadow-[0_0_10px_#00FF9D]" />}
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-8 h-8 flex items-center justify-center p-1 border",
                            isActive ? "border-emerald/40 bg-black" : "border-[#1A1A1A] bg-black"
                          )}>
                            <Identicon
                              value={account.address}
                              size={24}
                              theme="polkadot"
                            />
                          </div>
                          <div className="text-left">
                            <div className={cn(
                              "text-[10px] font-black uppercase truncate max-w-[180px] tracking-tight",
                              isActive ? "text-emerald" : "text-white"
                            )}>
                              {account.meta.name || "UNNAMED_ENTITY"}
                            </div>
                            <div className="text-[8px] font-mono text-zinc-600 mt-0.5 tracking-widest">
                              {account.address.slice(0, 8)}...{account.address.slice(-8)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isActive ? (
                            <div className="w-1.5 h-1.5 bg-emerald rounded-full animate-pulse shadow-[0_0_8px_#00FF9D]" />
                          ) : (
                             <ArrowRight className="w-3 h-3 text-zinc-800 group-hover:text-zinc-500 transition-colors" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : hasExtensions === false ? (
                <div className="space-y-6">
                   <div className="p-8 border border-red-500/20 bg-red-500/5 flex flex-col items-center text-center">
                     <ShieldCheck className="w-8 h-8 text-red-500/60 mb-4" />
                     <h3 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">No Extension Detected</h3>
                     <p className="text-[9px] text-zinc-500 font-mono leading-relaxed max-w-[240px]">
                       Portaldot requires a trusted Substrate extension for identity verification.
                     </p>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-2">
                     <a 
                       href="https://talisman.xyz/" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="p-3 border border-[#1A1A1A] text-center hover:border-emerald/40 transition-all group"
                     >
                        <div className="text-[9px] font-bold text-white uppercase group-hover:text-emerald">Talisman</div>
                        <div className="text-[7px] text-zinc-600 font-mono mt-1">Recommended</div>
                     </a>
                     <a 
                       href="https://subwallet.app/" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="p-3 border border-[#1A1A1A] text-center hover:border-emerald/40 transition-all group"
                     >
                        <div className="text-[9px] font-bold text-white uppercase group-hover:text-emerald">SubWallet</div>
                        <div className="text-[7px] text-zinc-600 font-mono mt-1">Institutional</div>
                     </a>
                   </div>

                   <button
                     onClick={enableMockMode}
                     className="w-full py-4 bg-emerald/10 border border-emerald/40 text-emerald font-black uppercase text-[9px] tracking-[0.2em] hover:bg-emerald hover:text-black transition-all"
                   >
                     ENTER DEMO MODE (BYPASS)
                   </button>
                </div>
              ) : (
                <div className="space-y-4">
                   <div className="p-10 border border-dashed border-[#1A1A1A] flex flex-col items-center justify-center text-center">
                     <ShieldCheck className="w-8 h-8 text-zinc-800 mb-4" />
                     <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-[0.1em] leading-relaxed">
                       No identities detected. <br /> Initialize extension to proceed.
                     </p>
                   </div>
                   <button
                     onClick={onConnect}
                     disabled={isConnecting}
                     className="w-full py-4 bg-emerald text-black font-black uppercase text-[10px] tracking-[0.3em] hover:bg-[#00FFBD] transition-all disabled:opacity-50"
                   >
                     {isConnecting ? "ENABLING..." : "ENABLE EXTENSION"}
                   </button>
                </div>
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-[#1A1A1A]">
              <div className="flex items-center justify-between">
                <span className="text-[7px] text-zinc-600 font-mono uppercase tracking-widest">Protocol Authority</span>
                <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald/20" />
                  <div className="w-1.5 h-1.5 bg-emerald/20" />
                  <div className="w-1.5 h-1.5 bg-emerald/20" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
