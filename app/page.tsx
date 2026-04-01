"use client";

import { useState } from "react";
import { Signer } from "ethers";
import { getSigner } from "@/lib/ethers";
import WalletConnect from "./components/WalletConnect";
import MintForm from "./components/MintForm";
import Gallery from "./components/Gallery";

export default function Home() {
  const [account, setAccount] = useState<string | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      const _signer = await getSigner();
      if (_signer) {
        setSigner(_signer);
        const address = await _signer.getAddress();
        setAccount(address);
      } else {
        alert("Web3 provider not found. Please install MetaMask.");
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 4001) {
        alert("Wallet connection rejected by user.");
      } else {
        alert("Failed to connect wallet.");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] dark:bg-[#121212] font-sans transition-colors duration-300">
      
      {/* Material UI AppBar */}
      <header className="sticky top-0 z-50 w-full bg-[#1976d2] dark:bg-[#1e1e1e] shadow-md dark:border-b dark:border-gray-800 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/20 dark:bg-[#1976d2]/20 rounded-full flex items-center justify-center shadow-inner">
                <span className="text-white font-black text-xl tracking-tighter">M</span>
              </div>
              <span className="text-xl font-bold tracking-widest uppercase">
                MoodNFT
              </span>
            </div>
            
            <WalletConnect 
              account={account} 
              onConnect={connectWallet} 
              isConnecting={isConnecting} 
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative">
        <MintForm signer={signer} account={account} />
        
        {/* Gallery Component fetching directly from Nero Blockchain */}
        <Gallery signer={signer} account={account} />
      </main>
      
    </div>
  );
}
