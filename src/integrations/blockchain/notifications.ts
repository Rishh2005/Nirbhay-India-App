import { supabase } from "@/integrations/supabase/client";
import { reportIncidentWithBlockchain } from "./index";
import { getProfileManager, linkGuardianOnChain, connectWallet } from "./web3";
import { submitIncidentReport, loadAccountFromMnemonic } from "./algorand";

export interface ContactNotification {
  contactId: string;
  name: string;
  phone: string;
  isGuardian: boolean;
}

export const notifyContactsViaBlockchain = async (
  location: { lat: number; lng: number },
  useAlgorand: boolean = false
): Promise<string[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  // Get user's emergency contacts
  const { data: contacts } = await supabase
    .from("emergency_contacts")
    .select("*")
    .eq("user_id", user.id)
    .order("priority", { ascending: true });

  if (!contacts || contacts.length === 0) {
    throw new Error("No emergency contacts found");
  }

  // Submit incident to blockchain
  const txHash = await reportIncidentWithBlockchain(
    location.lat,
    location.lng,
    undefined,
    useAlgorand
  );

  // Notify contacts via SMS/blockchain events
  // In production, this would integrate with SMS gateway or push notifications
  const notifications: string[] = [];
  
  for (const contact of contacts) {
    if (contact.is_guardian || contact.priority <= 2) {
      // Simulate notification - in production, send SMS/push notification
      notifications.push(contact.id);
      
      // Store notification in database
      await supabase.from("sos_notifications").insert({
        user_id: user.id,
        contact_id: contact.id,
        incident_tx_hash: txHash,
        status: "sent",
        location_lat: location.lat,
        location_lng: location.lng,
      });
    }
  }

  return notifications;
};

export const registerProfileOnBlockchain = async (
  fullName: string,
  phone: string,
  emergencyContacts: string[],
  useAlgorand: boolean = false
): Promise<string> => {
  if (useAlgorand) {
    const mnemonic = import.meta.env.VITE_ALGO_MNEMONIC as string;
    if (!mnemonic) throw new Error("Missing Algorand mnemonic");
    const account = loadAccountFromMnemonic(mnemonic);
    // Store profile hash on Algorand
    const profileHash = JSON.stringify({ fullName, phone, emergencyContacts });
    return await submitIncidentReport(account, {
      geoHash: profileHash,
      lat: 0,
      lng: 0,
      createdAt: Date.now(),
    });
  } else {
    const accounts = await connectWallet();
    const fromAddress = accounts[0];
    const contract = getProfileManager();
    const tx = contract.methods.registerProfile(fromAddress, fullName, phone, emergencyContacts);
    const gas = await tx.estimateGas({ from: fromAddress });
    const receipt = await tx.send({ from: fromAddress, gas: String(gas) });
    const txHash = receipt.transactionHash;
    return String(txHash as string | bigint);
  }
};

