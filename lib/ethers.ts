import { BrowserProvider, Signer } from "ethers";

/**
 * Gets the browser provider from window.ethereum.
 */
export const getProvider = (): BrowserProvider | null => {
  if (typeof window !== "undefined" && (window as any).ethereum) {
    return new BrowserProvider((window as any).ethereum);
  }
  return null;
};

/**
 * Requests accounts and gets a signer from the browser provider.
 */
export const getSigner = async (): Promise<Signer | null> => {
  const provider = getProvider();
  if (!provider) return null;
  
  // Prompt user for account connections
  await provider.send("eth_requestAccounts", []);
  
  return await provider.getSigner();
};
