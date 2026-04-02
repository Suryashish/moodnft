"use client";

import { useState } from "react";
import { Signer } from "ethers";
import { Sparkles, Image as ImageIcon, UploadCloud, Hexagon, CheckCircle2, AlertCircle } from "lucide-react";
import { getMoodNFTContract } from "@/lib/contract";
import { MOOD_LIBRARY } from "@/lib/moods";

interface MintFormProps {
  signer: Signer | null;
  account: string | null;
}

type MintStep = "IDLE" | "GENERATING" | "UPLOADING" | "MINTING" | "SUCCESS" | "ERROR";

export default function MintForm({ signer, account }: MintFormProps) {
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [step, setStep] = useState<MintStep>("IDLE");
  const [errorMsg, setErrorMsg] = useState("");
  const [successTx, setSuccessTx] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");

  const toggleMood = (mood: string) => {
    if (isProcessing) return;
    if (selectedMoods.includes(mood)) {
      setSelectedMoods(selectedMoods.filter((m) => m !== mood));
    } else {
      if (selectedMoods.length >= 5) {
        setErrorMsg("You can only select up to 5 moods at once to maintain artistic coherence.");
        return;
      }
      setErrorMsg(""); // clear error
      setSelectedMoods([...selectedMoods, mood]);
    }
  };

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMoods.length === 0) return;
    if (!signer || !account) {
      setErrorMsg("Please connect your wallet first.");
      setStep("ERROR");
      return;
    }

    try {
      setErrorMsg("");
      setSuccessTx("");
      setGeneratedImage("");
      
      // Step 1: Generate Image
      setStep("GENERATING");
      const imageRes = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moods: selectedMoods }),
      });
      const imageData = await imageRes.json();
      if (!imageRes.ok) throw new Error(imageData.error || "Failed to generate image");
      const imageUrl = imageData.imageUrl;
      setGeneratedImage(imageUrl);

      // Step 2: Upload Metadata to IPFS
      setStep("UPLOADING");
      const metadata = {
        name: "MoodNFT",
        description: selectedMoods.join(", "),
        image: imageUrl,
      };
      const ipfsRes = await fetch("/api/upload-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metadata),
      });
      const ipfsData = await ipfsRes.json();
      if (!ipfsRes.ok) throw new Error(ipfsData.error || "Failed to upload metadata");
      const tokenURI = ipfsData.tokenURI;

      // Step 3: Mint the NFT with the contract
      setStep("MINTING");
      const contract = getMoodNFTContract(signer);
      const tx = await contract.mint(tokenURI);
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      setSuccessTx(receipt.hash || tx.hash);
      setStep("SUCCESS");
      setSelectedMoods([]);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.reason || err.message || "An unexpected error occurred during the minting process.");
      setStep("ERROR");
    }
  };

  const isProcessing = step === "GENERATING" || step === "UPLOADING" || step === "MINTING";

  return (
    <div className="w-full max-w-xl mx-auto bg-white dark:bg-[#1e1e1e] rounded shadow-[0_3px_10px_rgb(0,0,0,0.12)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.4)] overflow-hidden transition-all duration-300">
      <div className="p-8 md:p-10">
        <div className="mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Capture Mood.</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
            Select up to 5 emotions. Our AI will algorithmically blend them into an immutable masterpiece.
          </p>
          {selectedMoods.length > 0 && (
            <div className="mt-4 pt-3 flex flex-wrap gap-2">
               <span className="text-xs font-bold text-gray-500 uppercase flex items-center pr-2">Engine:</span>
               {selectedMoods.map(m => (
                 <span key={`sel-${m}`} className="bg-[#1976d2] text-white text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded shadow-sm">
                   {m}
                 </span>
               ))}
            </div>
          )}
        </div>

        <form onSubmit={handleMint} className="space-y-8">
          <div className="w-full bg-gray-50 dark:bg-[#121212] p-4 rounded border border-gray-200 dark:border-gray-800 h-64 overflow-y-auto custom-scrollbar">
            <div className="flex flex-wrap gap-2.5">
              {MOOD_LIBRARY.map((m) => {
                const isSelected = selectedMoods.includes(m);
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleMood(m)}
                    disabled={isProcessing}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 border 
                      ${isSelected 
                        ? 'bg-[#1976d2] border-[#1976d2] text-white shadow-md scale-105' 
                        : 'bg-white dark:bg-[#1e1e1e] border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[#1976d2] hover:text-[#1976d2]'
                      }
                      ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {m}
                  </button>
                )
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={selectedMoods.length === 0 || isProcessing || !account}
            className={`w-full flex items-center justify-center gap-3 py-4 rounded font-bold text-base tracking-widest uppercase transition-all duration-300 
              ${
                !account || selectedMoods.length === 0 || isProcessing
                  ? "bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-600 shadow-none cursor-not-allowed"
                  : "bg-[#1976d2] text-white hover:bg-[#1565c0] shadow-[0_3px_5px_-1px_rgba(0,0,0,0.2),0_6px_10px_0_rgba(0,0,0,0.14),0_1px_18px_0_rgba(0,0,0,0.12)] active:shadow-sm"
              }
            `}
          >
            {isProcessing ? (
              <Sparkles className="w-5 h-5 animate-pulse" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            {isProcessing ? "MINTING..." : "MINT MOOD NFT"}
          </button>
        </form>

        {/* Status Indications */}
        {step !== "IDLE" && (
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
            {generatedImage && (
              <div className="mb-6 rounded overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.15)] dark:shadow-[0_4px_20px_rgb(0,0,0,0.6)] relative aspect-square group">
                <img src={generatedImage} alt="Generated Mood Artwork" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-4 left-4 text-white text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded flex items-center gap-2 bg-[#1976d2]/90 backdrop-blur-sm shadow">
                  <ImageIcon className="w-3.5 h-3.5" />
                  AI Masterpiece
                </div>
              </div>
            )}

            {step === "ERROR" && (
              <div className="flex gap-4 text-[#d32f2f] bg-[#fdecea] dark:bg-[#d32f2f]/10 p-4 rounded border border-[#f5c2c7] dark:border-[#d32f2f]/30">
                <AlertCircle className="w-6 h-6 shrink-0" />
                <p className="text-sm font-medium leading-relaxed">{errorMsg}</p>
              </div>
            )}

            {step === "SUCCESS" && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[#2e7d32] bg-[#edf7ed] dark:bg-[#2e7d32]/10 p-5 rounded border border-[#c3e6cb] dark:border-[#2e7d32]/30">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#2e7d32]/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider mb-1">Minted Successfully</h4>
                    {successTx && (
                      <p className="text-xs opacity-90 break-all font-mono">
                        Tx: {successTx}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="space-y-5 bg-gray-50 dark:bg-gray-800/30 p-6 rounded shadow-inner border border-gray-100 dark:border-gray-800">
                <StatusRow
                  active={step === "GENERATING"}
                  done={step === "UPLOADING" || step === "MINTING"}
                  icon={<ImageIcon className="w-5 h-5" />}
                  text="GENERATING ARTWORK"
                />
                <StatusRow
                  active={step === "UPLOADING"}
                  done={step === "MINTING"}
                  icon={<UploadCloud className="w-5 h-5" />}
                  text="UPLOADING TO IPFS"
                />
                <StatusRow
                  active={step === "MINTING"}
                  done={false}
                  icon={<Hexagon className="w-5 h-5" />}
                  text="SECURING ON NERO CHAIN"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusRow({ active, done, icon, text }: { active: boolean; done: boolean; icon: React.ReactNode; text: string }) {
  let stateClasses = "text-gray-400 dark:text-gray-500";
  let iconClasses = "text-gray-400 dark:text-gray-500";
  
  if (done) {
    stateClasses = "text-[#2e7d32] line-through opacity-70";
    iconClasses = "text-[#2e7d32]";
    icon = <CheckCircle2 className="w-5 h-5" />;
  } else if (active) {
    stateClasses = "text-[#1976d2] font-bold";
    iconClasses = "text-[#1976d2] animate-bounce";
  }

  return (
    <div className={`flex items-center gap-4 transition-all duration-300 ${stateClasses}`}>
      <div className={`w-8 h-8 flex items-center justify-center shrink-0 ${iconClasses}`}>
        {icon}
      </div>
      <span className="text-xs uppercase tracking-widest">{text}</span>
    </div>
  );
}
