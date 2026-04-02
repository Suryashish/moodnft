"use client";

import { useEffect, useState } from "react";
import { Signer } from "ethers";
import { getMoodNFTContract } from "@/lib/contract";
import { Image as ImageIcon, ExternalLink, Loader2, Wallet } from "lucide-react";

interface NFTData {
  tokenId: number;
  name: string;
  description: string;
  image: string;
}

interface GalleryProps {
  signer: Signer | null;
  account: string | null;
}

export default function Gallery({ signer, account }: GalleryProps) {
  const [nfts, setNfts] = useState<NFTData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to convert an IPFS URI into a Pinata Gateway HTTP URL
  const ipfsToGateway = (uri: string) => {
    if (!uri) return "";
    if (uri.startsWith("ipfs://")) {
      return uri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
    }
    return uri;
  };

  const fetchNFTs = async () => {
    if (!signer) return;

    setIsLoading(true);
    setError(null);

    try {
      const contract = getMoodNFTContract(signer);

      // We read the global token supply from the state
      let totalSupplyRaw;
      try {
        totalSupplyRaw = await contract.totalSupply();
      } catch (callErr: any) {
        if (callErr.code === "BAD_DATA" || callErr.message?.includes("0x")) {
          // Attempt to get the current network to show the user exactly what's wrong!
          let currentChainId = "Unknown";
          try {
             if(signer.provider) {
               const net = await signer.provider.getNetwork();
               currentChainId = net.chainId.toString();
             }
          } catch(e) {}
          
          throw new Error(`Contract not found on the active network (Chain ID: ${currentChainId}). Remix deployed it to NERO, but your browser's Web3 extension is feeding us a different network! Check if a different wallet (like Rabby/Coinbase) is hijacking 'window.ethereum' or if MetaMask is set to a different network in this tab.`);
        }
        throw callErr;
      }
      const totalSupply = Number(totalSupplyRaw);

      if (totalSupply === 0) {
        setNfts([]);
        setIsLoading(false);
        return;
      }

      // Fetch the latest up to 12 NFTs
      const limit = Math.min(12, totalSupply);
      const startId = totalSupply - 1;
      
      const loadedNfts: NFTData[] = [];

      for (let i = 0; i < limit; i++) {
        const tokenId = startId - i;
        try {
          const tokenURI = await contract.tokenURI(tokenId);
          
          if (!tokenURI) continue;
          const metadataUrl = ipfsToGateway(tokenURI);
          
          // Fetch exact JSON metadata generated previously and stored on IPFS
          const metaRes = await fetch(metadataUrl);
          if (!metaRes.ok) continue;
          
          const metaJson = await metaRes.json();

          loadedNfts.push({
            tokenId,
            name: metaJson.name || "MoodNFT",
            description: metaJson.description || "",
            image: ipfsToGateway(metaJson.image), // Convert image IPFS to HTTP!
          });
        } catch (fetchErr) {
          console.warn(`Failed to fetch metadata for Token ID ${tokenId}`, fetchErr);
        }
      }

      setNfts(loadedNfts);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load the gallery from Nero Chain.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch when component mounts or signer changes
  useEffect(() => {
    if (signer) {
      fetchNFTs();
    }
  }, [signer]);

  if (!account) {
    return (
      <div className="w-full mt-16 max-w-6xl mx-auto py-24 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded">
        <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="font-bold tracking-widest uppercase text-sm">Please connect wallet to view Gallery</p>
      </div>
    );
  }

  return (
    <div className="w-full mt-16 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">On-Chain Gallery</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium uppercase tracking-widest">
            Latest Moods Minted
          </p>
        </div>
        <button 
          onClick={fetchNFTs}
          disabled={isLoading}
          className="text-xs font-bold uppercase tracking-widest text-[#1976d2] hover:text-[#1565c0] active:text-[#0d47a1] bg-[#1976d2]/10 px-4 py-2 rounded transition-colors disabled:opacity-50"
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {isLoading && nfts.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center text-gray-400">
          <Loader2 className="w-10 h-10 animate-spin text-[#1976d2] mb-4" />
          <p className="font-bold tracking-widest uppercase">Fetching from Chain...</p>
        </div>
      ) : error ? (
        <div className="py-12 bg-[#ffebee] dark:bg-[#d32f2f]/10 border border-[#ffcdd2] dark:border-[#d32f2f]/30 rounded flex flex-col items-center justify-center text-[#d32f2f] p-4 text-center">
          <span className="font-bold uppercase tracking-wider mb-2">Sync Error</span>
          <p className="text-sm">{error}</p>
        </div>
      ) : nfts.length === 0 ? (
        <div className="py-24 text-center text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-bold tracking-widest uppercase text-sm">No Moods Found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {nfts.map((nft) => (
            <div key={nft.tokenId} className="bg-white dark:bg-[#1e1e1e] rounded shadow-[0_3px_10px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-shadow duration-300 overflow-hidden flex flex-col">
              
              <div className="w-full aspect-square bg-gray-100 dark:bg-gray-900 relative overflow-hidden group">
                {nft.image ? (
                  <img 
                    src={nft.image} 
                    alt={nft.description} 
                    className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ImageIcon className="w-10 h-10 opacity-30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                   <p className="text-xs text-white/80 uppercase tracking-widest leading-relaxed">
                     <span className="text-[#90caf9] font-bold">Metadata:</span> IPFS Native
                   </p>
                </div>
              </div>

              <div className="p-6 grow flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-black text-xl text-gray-900 dark:text-white uppercase tracking-tight">
                    Token #{nft.tokenId}
                  </h3>
                  <a href={`https://gateway.pinata.cloud/ipfs/`} target="_blank" className="text-gray-400 hover:text-[#1976d2] transition-colors" title="View Source">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed italic border-l-2 border-[#1976d2] pl-3">
                  "{nft.description}"
                </p>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
