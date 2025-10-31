import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerSW } from "virtual:pwa-register";
import { readSOSQueue, clearSOSQueue, isOnline } from "@/utils/offline";

// Register service worker for offline support
registerSW({ immediate: true });

// When back online, try sending queued SOS items in background
async function processQueuedSOS() {
  if (!isOnline()) return;
  const queued = readSOSQueue();
  if (!queued.length) return;
  const { reportIncidentWithBlockchain } = await import("@/integrations/blockchain");
  for (const item of queued) {
    try {
      await reportIncidentWithBlockchain(item.lat, item.lng, `${item.lat},${item.lng}`, item.useAlgorand);
    } catch {
      // keep remaining if failure
      return;
    }
  }
  clearSOSQueue();
}

window.addEventListener("online", () => {
  processQueuedSOS();
});

// Process once on startup as well
processQueuedSOS();

createRoot(document.getElementById("root")!).render(<App />);
