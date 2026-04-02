"use client";

import { Sparkles, Brain, Link, ArrowDown } from "lucide-react";

export default function LandingHero() {
  const scrollToMint = () => {
    const mintSection = document.getElementById("mint-section");
    if (mintSection) {
      mintSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="w-full pb-16 md:pb-24 pt-8 border-b border-gray-200 dark:border-gray-800 mb-12">
      
      {/* Hero Banner Area */}
      <div className="text-center max-w-4xl mx-auto px-4 mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1976d2]/10 dark:bg-[#1976d2]/20 text-[#1976d2] dark:text-[#90caf9] text-xs font-bold uppercase tracking-widest mb-6 shadow-sm border border-[#1976d2]/20">
          <Sparkles className="w-3.5 h-3.5" />
          Powered by NERO Chain & Stability AI
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tighter leading-tight mb-6 uppercase">
          Solidify Your Emotions as <br className="hidden sm:block" />
          <span className="bg-clip-text text-transparent bg-linear-to-r from-[#1976d2] to-[#42a5f5]">
            Immutable Assets.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          Every day is fleeting, but what if you could capture your exact emotional state forever? Submit your thoughts, let our AI paint a 1-of-1 masterpiece, and forge it permanently into the ultra-fast NERO blockchain.
        </p>
        
        <button 
          onClick={scrollToMint}
          className="group relative overflow-hidden inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#1976d2] text-white rounded text-sm font-bold tracking-widest uppercase transition-all duration-300 shadow-[0_4px_14px_0_rgba(25,118,210,0.39)] hover:shadow-[0_6px_20px_rgba(25,118,210,0.23)] hover:bg-[#1565c0] hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
        >
          <span>Start Minting</span>
          <ArrowDown className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-1" />
        </button>
      </div>

      {/* Feature Story Grid */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          
          <FeatureCard 
            step="1"
            icon={<Brain className="w-6 h-6 text-[#1976d2]" />}
            title="Express Your Mood"
            description="Use plain English to describe exactly how you feel. We use advanced NLP to comprehend your personal vibe or philosophical anchor for the day."
          />

          <FeatureCard 
            step="2"
            icon={<Sparkles className="w-6 h-6 text-[#1976d2]" />}
            title="AI Transformation"
            description="Stability AI's v2beta core models digest your narrative and synthetically generate a stunning, high-fidelity 1-of-1 digital art composition."
          />

          <FeatureCard 
            step="3"
            icon={<Link className="w-6 h-6 text-[#1976d2]" />}
            title="Immutable Anchor"
            description="The asset is heavily hashed via Pinata on the decentralized IPFS network, and cryptographically sealed on the NERO blockchain forever."
          />

        </div>
      </div>

    </div>
  );
}

function FeatureCard({ step, icon, title, description }: { step: string, icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="relative bg-white dark:bg-[#1e1e1e] p-8 rounded shadow-[0_3px_10px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-transparent dark:border-gray-800 transition-all duration-300 hover:-translate-y-1 group">
      <div className="absolute top-0 right-0 p-6 text-gray-100 dark:text-gray-900/40 font-black text-6xl tracking-tighter select-none pointer-events-none transition-colors duration-300 group-hover:text-[#1976d2]/5 dark:group-hover:text-[#1976d2]/10">
        #{step}
      </div>
      
      <div className="w-14 h-14 rounded-full bg-[#1976d2]/10 flex items-center justify-center mb-6 shadow-inner relative z-10">
        {icon}
      </div>
      
      <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-3 relative z-10">
        {title}
      </h3>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed relative z-10">
        {description}
      </p>
    </div>
  );
}
