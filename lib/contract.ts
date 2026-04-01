import { Contract, Signer, Provider } from "ethers";
import { moodNFTAbi } from "./abi";

const CONTRACT_ADDRESS = "0x9C6F056aE2c9f60b76408F0014D723441dA07578";

/**
 * Gets the MoodNFT contract instance connected to the given Signer or Provider.
 */
export const getMoodNFTContract = (runner: Signer | Provider): Contract => {
  return new Contract(CONTRACT_ADDRESS, moodNFTAbi, runner);
};
