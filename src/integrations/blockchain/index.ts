// Unified blockchain service
export * from "./web3";
export * from "./algorand";
export * from "./ipfs";

import { submitEvidenceOnChain as submitEvidenceWeb3, reportIncidentOnChain } from "./web3";
import { submitEvidenceRegistry as submitEvidenceAlgo, submitIncidentReport, sha256Hex } from "./algorand";
import { pinFileToIPFS } from "./ipfs";
import { connectWallet, getWeb3 } from "./web3";
import { loadAccountFromMnemonic } from "./algorand";

export interface EvidenceSubmissionResult {
  txHash: string;
  cid: string;
  sha256: string;
  chain: "ethereum" | "algorand";
}

export const submitEvidenceWithBlockchain = async (
  file: File,
  useAlgorand: boolean = false
): Promise<EvidenceSubmissionResult> => {
  // Step 1: Upload to IPFS
  const { cid } = await pinFileToIPFS(file);

  // Step 2: Calculate SHA-256 hash
  const fileBuffer = await file.arrayBuffer();
  const sha256 = await sha256Hex(fileBuffer);

  // Step 3: Submit to blockchain
  if (useAlgorand) {
    const mnemonic = import.meta.env.VITE_ALGO_MNEMONIC as string;
    if (!mnemonic) throw new Error("Missing Algorand mnemonic");
    const account = loadAccountFromMnemonic(mnemonic);
    const txHash = await submitEvidenceAlgo(account, {
      cid,
      sha256,
      mimeType: file.type,
      createdAt: Date.now(),
    });
    return { txHash, cid, sha256, chain: "algorand" };
  } else {
    // Use Ethereum/web3
    const accounts = await connectWallet();
    const fromAddress = accounts[0];
    const web3 = getWeb3();
    const hashBytes = web3.utils.keccak256(sha256);
    const txHash = await submitEvidenceOnChain(fromAddress, cid, hashBytes, file.type);
    return { txHash, cid, sha256, chain: "ethereum" };
  }
};

export const reportIncidentWithBlockchain = async (
  lat: number,
  lng: number,
  evidenceHash?: string,
  useAlgorand: boolean = false
): Promise<string> => {
  const geoHash = `${lat.toFixed(6)},${lng.toFixed(6)}`;

  if (useAlgorand) {
    const mnemonic = import.meta.env.VITE_ALGO_MNEMONIC as string;
    if (!mnemonic) throw new Error("Missing Algorand mnemonic");
    const account = loadAccountFromMnemonic(mnemonic);
    const txHash = await submitIncidentReport(account, {
      geoHash,
      lat,
      lng,
      createdAt: Date.now(),
    });
    return txHash;
  } else {
    // Use Ethereum/web3
    const accounts = await connectWallet();
    const fromAddress = accounts[0];
    return await reportIncidentOnChain(fromAddress, geoHash, lat, lng, evidenceHash);
  }
};

