export const isOnline = () => typeof navigator !== "undefined" ? navigator.onLine : true;

type PendingSOS = { lat: number; lng: number; useAlgorand: boolean; createdAt: number };
type PendingEvidence = { fileName: string; mimeType: string; createdAt: number; useAlgorand: boolean };

const SOS_KEY = "nirbhay_pending_sos";
const EVIDENCE_KEY = "nirbhay_pending_evidence";

export const enqueueSOS = (item: PendingSOS) => {
  const list = readSOSQueue();
  list.push(item);
  localStorage.setItem(SOS_KEY, JSON.stringify(list));
};

export const readSOSQueue = (): PendingSOS[] => {
  try {
    return JSON.parse(localStorage.getItem(SOS_KEY) || "[]");
  } catch {
    return [];
  }
};

export const clearSOSQueue = () => localStorage.removeItem(SOS_KEY);

export const enqueueEvidence = (item: PendingEvidence) => {
  const list = readEvidenceQueue();
  list.push(item);
  localStorage.setItem(EVIDENCE_KEY, JSON.stringify(list));
};

export const readEvidenceQueue = (): PendingEvidence[] => {
  try {
    return JSON.parse(localStorage.getItem(EVIDENCE_KEY) || "[]");
  } catch {
    return [];
  }
};

export const clearEvidenceQueue = () => localStorage.removeItem(EVIDENCE_KEY);

