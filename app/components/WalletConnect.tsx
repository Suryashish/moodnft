"use client";

import { Wallet, Loader2 } from "lucide-react";

interface WalletConnectProps {
  account: string | null;
  onConnect: () => void;
  isConnecting: boolean;
}

export default function WalletConnect({
  account,
  onConnect,
  isConnecting,
}: WalletConnectProps) {
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (account) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded border border-white/20 dark:border-white/10 shadow-sm">
        <div className="w-2.5 h-2.5 rounded-full bg-[#00e676] shadow-[0_0_8px_rgba(0,230,118,0.8)] animate-pulse"></div>
        <span className="text-sm font-bold tracking-wider text-white uppercase">
          {formatAddress(account)}
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={onConnect}
      disabled={isConnecting}
      className={`relative overflow-hidden flex items-center gap-2 px-6 py-2.5 rounded text-sm font-bold tracking-widest uppercase transition-all duration-300 shadow hover:shadow-md active:shadow-sm
        ${
          isConnecting
            ? "bg-indigo-300 text-indigo-50 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500 shadow-none"
            : "bg-white text-indigo-700 hover:bg-gray-50 active:bg-gray-200 dark:bg-indigo-500 dark:text-white dark:hover:bg-indigo-400"
        }
      `}
    >
      {isConnecting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Wallet className="w-4 h-4" />
      )}
      {isConnecting ? "CONNECTING..." : "CONNECT WALLET"}
    </button>
  );
}
