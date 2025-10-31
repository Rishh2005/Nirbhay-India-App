const PINATA_JWT = import.meta.env.VITE_PINATA_JWT as string;

export interface PinResult {
  cid: string;
  url: string;
}

/**
 * Uploads a file to Pinata IPFS using JWT authentication.
 * Throws detailed error on failure.
 * @param file The File object to pin to IPFS
 * @returns PinResult containing cid and gateway url
 */
export const pinFileToIPFS = async (file: File): Promise<PinResult> => {
  const form = new FormData();
  form.append("file", file);

  const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      // Only Authorization header here; no Content-Type when using FormData
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: form,
  });

  if (!response.ok) {
    // Log and throw full error details for easier debugging
    const errorText = await response.text();
    console.error("Pinata upload failed:", response.status, errorText);
    throw new Error(`Pinata upload failed: ${errorText}`);
  }

  const data = await response.json();

  if (!data.IpfsHash) {
    throw new Error("Invalid response from Pinata: missing IpfsHash");
  }

  return {
    cid: data.IpfsHash,
    url: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
  };
};
