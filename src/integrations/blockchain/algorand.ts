import algosdk from "algosdk";

const ALGOD_URL = import.meta.env.VITE_ALGOD_URL as string;
const ALGOD_TOKEN = import.meta.env.VITE_ALGOD_TOKEN as string;
const ALGOD_PORT = (import.meta.env.VITE_ALGOD_PORT as string) || "";

export const getAlgodClient = () => new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_URL, ALGOD_PORT);

export const sha256Hex = async (data: ArrayBuffer): Promise<string> => {
  const hash = await crypto.subtle.digest("SHA-256", data);
  const bytes = Array.from(new Uint8Array(hash));
  return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
};

export interface EvidenceOnChain {
  cid: string;
  sha256: string;
  mimeType: string;
  createdAt: number;
}

export const submitEvidenceRegistry = async (sender: algosdk.Account, payload: EvidenceOnChain) => {
  const client = getAlgodClient();
  const params = await client.getTransactionParams().do();
  const note = new TextEncoder().encode(JSON.stringify({ type: "EVIDENCE", ...payload }));
  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: sender.addr,
    to: sender.addr,
    amount: 0,
    suggestedParams: params,
    note,
  });
  const signed = txn.signTxn(sender.sk);
  const { txId } = await client.sendRawTransaction(signed).do();
  await algosdk.waitForConfirmation(client, txId, 4);
  return txId;
};

export interface IncidentOnChain {
  geoHash: string;
  lat: number;
  lng: number;
  createdAt: number;
}

export const submitIncidentReport = async (sender: algosdk.Account, payload: IncidentOnChain) => {
  const client = getAlgodClient();
  const params = await client.getTransactionParams().do();
  const note = new TextEncoder().encode(JSON.stringify({ type: "INCIDENT", ...payload }));
  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: sender.addr,
    to: sender.addr,
    amount: 0,
    suggestedParams: params,
    note,
  });
  const signed = txn.signTxn(sender.sk);
  const { txId } = await client.sendRawTransaction(signed).do();
  await algosdk.waitForConfirmation(client, txId, 4);
  return txId;
};

export const loadAccountFromMnemonic = (mn: string) => algosdk.mnemonicToSecretKey(mn);



