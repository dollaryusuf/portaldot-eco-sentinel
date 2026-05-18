/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Identicon from '@polkadot/react-identicon';
import { ChevronDown, Shield, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

interface IdentityWidgetProps {
  activeAccount: InjectedAccountWithMeta | null;
  balance: number | null;
  role: string;
  isMock?: boolean;
  onOpenModal: () => void;
  onDisconnect: () => void;
}

export function IdentityWidget({ activeAccount, balance, role, isMock, onOpenModal, onDisconnect }: IdentityWidgetProps) {
  if (!activeAccount) {
    return (
      <button 
        onClick={onOpenModal}
        className="px-6 py-2 bg-emerald/10 border border-emerald/30 text-emerald text-[9px] font-black uppercase tracking-[0.2em] hover:bg-emerald hover:text-black transition-all flex items-center gap-3 group whitespace-nowrap"
      >
        <span className="w-1.5 h-1.5 bg-emerald rounded-full group-hover:bg-black transition-colors" />
        Initialize Identity
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 group">
      <div className="bg-black border border-[#1A1A1A] h-10 px-4 flex items-center gap-4 relative">
        {isMock && (
          <div className="absolute -top-3 left-0 px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/40 text-yellow-500 text-[6px] font-mono uppercase tracking-[0.2em] animate-pulse">
            Demo Mode (No Extension)
          </div>
        )}
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border border-emerald/20 flex items-center justify-center p-0.5 bg-black">
            <Identicon
              value={activeAccount.address}
              size={20}
              theme="polkadot"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-white uppercase tracking-tight">
                {activeAccount.meta.name || "Untitled"}
              </span>
              <div className="px-1.5 py-0.5 bg-emerald/5 border border-emerald/20 flex items-center gap-1">
                 <Shield className="w-2 h-2 text-emerald" />
                 <span className="text-[7px] text-emerald font-black uppercase tracking-tighter">{role}</span>
              </div>
            </div>
            <span className="text-[8px] font-mono text-zinc-500 tracking-widest mt-0.5">
              {activeAccount.address.slice(0, 5)}...{activeAccount.address.slice(-3)}
            </span>
          </div>
        </div>
        
        <div className="h-4 w-[1px] bg-white/5 mx-2" />
        
        <div className="flex items-center gap-4">
           <div className="flex flex-col items-end min-w-[80px]">
             <span className="text-[8px] text-zinc-600 font-mono uppercase tracking-tighter">Balance</span>
             <span className="text-[10px] text-white font-mono font-bold">
               {balance !== null ? balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '---.--'} 
               <span className="text-[8px] text-emerald/40 uppercase ml-1">DOT</span>
             </span>
           </div>
           
           <button 
             onClick={onOpenModal}
             className="text-zinc-600 hover:text-emerald transition-colors"
           >
             <ChevronDown className="w-4 h-4" />
           </button>
        </div>
      </div>

      <button 
        onClick={onDisconnect}
        className="h-10 w-10 bg-black border border-[#1A1A1A] border-l-0 flex items-center justify-center text-zinc-800 hover:text-red-500 hover:bg-red-500/5 transition-all"
        title="Disconnect Identity"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}
