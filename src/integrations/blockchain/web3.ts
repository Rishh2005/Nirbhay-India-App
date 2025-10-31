import Web3 from "web3";

const RPC_URL = import.meta.env.VITE_ETH_RPC_URL || "https://sepolia.infura.io/v3/YOUR_PROJECT_ID";
const CHAIN_ID = parseInt(import.meta.env.VITE_CHAIN_ID || "11155111"); // Sepolia testnet

interface EthereumWindow extends Window {
  ethereum?: {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  };
}

export const getWeb3 = (): Web3 => {
  if (typeof window !== "undefined" && (window as EthereumWindow).ethereum) {
    return new Web3((window as EthereumWindow).ethereum as unknown as string);
  }
  return new Web3(new Web3.providers.HttpProvider(RPC_URL));
};

export const connectWallet = async (): Promise<string[]> => {
  if (typeof window !== "undefined" && (window as EthereumWindow).ethereum) {
    const eth = (window as EthereumWindow).ethereum!;
    const accounts = await eth.request({ method: "eth_requestAccounts" }) as string[];
    await eth.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${CHAIN_ID.toString(16)}` }],
    }).catch(() => {
      // Chain doesn't exist, add it
      return eth.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: `0x${CHAIN_ID.toString(16)}`,
          chainName: "Sepolia Testnet",
          nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
          rpcUrls: [RPC_URL],
        }],
      });
    });
    return accounts;
  }
  throw new Error("MetaMask not found");
};

// Contract ABIs
const EVIDENCE_REGISTRY_ABI = [
  {
    inputs: [
      { name: "cid", type: "string" },
      { name: "sha256Hash", type: "bytes32" },
      { name: "mimeType", type: "string" },
    ],
    name: "submitEvidence",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "evidenceId", type: "uint256" }],
    name: "getEvidence",
    outputs: [
      { name: "cid", type: "string" },
      { name: "sha256Hash", type: "bytes32" },
      { name: "mimeType", type: "string" },
      { name: "submitter", type: "address" },
      { name: "timestamp", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "evidenceId", type: "uint256" },
      { indexed: true, name: "submitter", type: "address" },
      { indexed: false, name: "cid", type: "string" },
    ],
    name: "EvidenceSubmitted",
    type: "event",
  },
] as const;

const PROFILE_MANAGER_ABI = [
  {
    inputs: [
      { name: "walletAddress", type: "address" },
      { name: "fullName", type: "string" },
      { name: "phone", type: "string" },
      { name: "emergencyContacts", type: "string[]" },
    ],
    name: "registerProfile",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "walletAddress", type: "address" }],
    name: "getProfile",
    outputs: [
      { name: "fullName", type: "string" },
      { name: "phone", type: "string" },
      { name: "emergencyContacts", type: "string[]" },
      { name: "verified", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "walletAddress", type: "address" },
      { indexed: false, name: "fullName", type: "string" },
    ],
    name: "ProfileRegistered",
    type: "event",
  },
] as const;

const GUARDIAN_REGISTRY_ABI = [
  {
    inputs: [
      { name: "guardianAddress", type: "address" },
      { name: "name", type: "string" },
      { name: "type_", type: "uint8" }, // 0=guardian, 1=hospital, 2=authority
    ],
    name: "linkGuardian",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "guardianAddress", type: "address" },
      { name: "verified", type: "bool" },
    ],
    name: "verifyGuardian",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "guardianAddress", type: "address" }],
    name: "getGuardian",
    outputs: [
      { name: "name", type: "string" },
      { name: "type_", type: "uint8" },
      { name: "verified", type: "bool" },
      { name: "linkedBy", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "guardianAddress", type: "address" },
      { indexed: false, name: "name", type: "string" },
    ],
    name: "GuardianLinked",
    type: "event",
  },
] as const;

const INCIDENT_REPORT_ABI = [
  {
    inputs: [
      { name: "geoHash", type: "bytes32" },
      { name: "lat", type: "int256" },
      { name: "lng", type: "int256" },
      { name: "evidenceHash", type: "bytes32" },
    ],
    name: "reportIncident",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "incidentId", type: "uint256" }],
    name: "getIncident",
    outputs: [
      { name: "geoHash", type: "bytes32" },
      { name: "lat", type: "int256" },
      { name: "lng", type: "int256" },
      { name: "reporter", type: "address" },
      { name: "timestamp", type: "uint256" },
      { name: "verified", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "incidentId", type: "uint256" },
      { name: "verified", type: "bool" },
    ],
    name: "updateIncidentStatus",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "incidentId", type: "uint256" },
      { indexed: true, name: "reporter", type: "address" },
      { indexed: false, name: "geoHash", type: "bytes32" },
    ],
    name: "IncidentReported",
    type: "event",
  },
] as const;

const EVIDENCE_REGISTRY_ADDRESS = import.meta.env.VITE_EVIDENCE_REGISTRY_ADDRESS as string;
const PROFILE_MANAGER_ADDRESS = import.meta.env.VITE_PROFILE_MANAGER_ADDRESS as string;
const GUARDIAN_REGISTRY_ADDRESS = import.meta.env.VITE_GUARDIAN_REGISTRY_ADDRESS as string;
const INCIDENT_REPORT_ADDRESS = import.meta.env.VITE_INCIDENT_REPORT_ADDRESS as string;

export const getEvidenceRegistry = () => {
  const web3 = getWeb3();
  return new web3.eth.Contract(EVIDENCE_REGISTRY_ABI, EVIDENCE_REGISTRY_ADDRESS);
};

export const getProfileManager = () => {
  const web3 = getWeb3();
  return new web3.eth.Contract(PROFILE_MANAGER_ABI, PROFILE_MANAGER_ADDRESS);
};

export const getGuardianRegistry = () => {
  const web3 = getWeb3();
  return new web3.eth.Contract(GUARDIAN_REGISTRY_ABI, GUARDIAN_REGISTRY_ADDRESS);
};

export const getIncidentReport = () => {
  const web3 = getWeb3();
  return new web3.eth.Contract(INCIDENT_REPORT_ABI, INCIDENT_REPORT_ADDRESS);
};

// Helper functions
export const submitEvidenceOnChain = async (
  fromAddress: string,
  cid: string,
  sha256Hash: string,
  mimeType: string
): Promise<string> => {
  const contract = getEvidenceRegistry();
  const hashBytes = getWeb3().utils.keccak256(sha256Hash);
  const tx = contract.methods.submitEvidence(cid, hashBytes, mimeType);
  const gas = await tx.estimateGas({ from: fromAddress });
  const receipt = await tx.send({ from: fromAddress, gas: String(gas) });
  return String(receipt.transactionHash as string | bigint);
};

export const reportIncidentOnChain = async (
  fromAddress: string,
  geoHash: string,
  lat: number,
  lng: number,
  evidenceHash?: string
): Promise<string> => {
  const contract = getIncidentReport();
  const geoHashBytes = getWeb3().utils.keccak256(geoHash);
  const evHashBytes = evidenceHash ? getWeb3().utils.keccak256(evidenceHash) : "0x0";
  const latScaled = Math.round(lat * 1e6); // Scale for int256
  const lngScaled = Math.round(lng * 1e6);
  const tx = contract.methods.reportIncident(geoHashBytes, latScaled, lngScaled, evHashBytes);
  const gas = await tx.estimateGas({ from: fromAddress });
  const receipt = await tx.send({ from: fromAddress, gas: String(gas) });
  return String(receipt.transactionHash as string | bigint);
};

export const registerProfileOnChain = async (
  fromAddress: string,
  fullName: string,
  phone: string,
  emergencyContacts: string[]
): Promise<string> => {
  const contract = getProfileManager();
  const tx = contract.methods.registerProfile(fromAddress, fullName, phone, emergencyContacts);
  const gas = await tx.estimateGas({ from: fromAddress });
  const receipt = await tx.send({ from: fromAddress, gas: String(gas) });
  return String(receipt.transactionHash as string | bigint);
};

export const linkGuardianOnChain = async (
  fromAddress: string,
  guardianAddress: string,
  name: string,
  type_: number // 0=guardian, 1=hospital, 2=authority
): Promise<string> => {
  const contract = getGuardianRegistry();
  const tx = contract.methods.linkGuardian(guardianAddress, name, type_);
  const gas = await tx.estimateGas({ from: fromAddress });
  const receipt = await tx.send({ from: fromAddress, gas: String(gas) });
  return String(receipt.transactionHash as string | bigint);
};

