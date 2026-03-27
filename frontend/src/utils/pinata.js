// src/utils/pinata.js
// All IPFS operations. The contract only stores a metadataCID on-chain.
// Full batch details (name, location, date, imageCID) live in that JSON on IPFS.

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

// Gateway used for resolving CIDs to URLs (Pinata first — files are pinned there).
export const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs';

// Ordered list of gateways tried when fetching metadata JSON.
// cloudflare-ipfs.com was shut down in 2023 — do not use.
const METADATA_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs',
  'https://w3s.link/ipfs',
  'https://dweb.link/ipfs',
];

// ─── Pin an existing CID to our Pinata account (by hash) ───────────────────
// Used when a CID was uploaded by the backend with different credentials.
// Pinata will fetch the content from IPFS and pin it to our account.
// Returns true on success, false if already pinned or on error.
export const pinCidByHash = async (cid) => {
  if (!cid || !PINATA_JWT) return false;
  const clean = String(cid).replace('ipfs://', '').trim();
  try {
    const res = await fetch('https://api.pinata.cloud/pinning/pinByHash', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hashToPin: clean,
        pinataMetadata: { name: `herbtrace-image-${clean.slice(0, 10)}` },
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.warn(`pinCidByHash failed (${res.status}):`, text);
      return false;
    }
    console.log(`📌 pinCidByHash queued for: ${clean}`);
    return true;
  } catch (e) {
    console.warn('pinCidByHash error:', e);
    return false;
  }
};

// ─── Upload an image file → returns CID ────────────────────────────────────
export const uploadImageToPinata = async (file, label = "herb-image") => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("pinataMetadata", JSON.stringify({ name: label }));

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: { Authorization: `Bearer ${PINATA_JWT}` },
    body: formData
  });
  if (!res.ok) throw new Error(`Image upload failed: ${res.statusText}`);
  return (await res.json()).IpfsHash;
};

// ─── Upload a PDF file → returns CID ───────────────────────────────────────
export const uploadPdfToPinata = async (file, batchId) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("pinataMetadata", JSON.stringify({
    name: `HerbTrace_LabReport_Batch_${batchId}`,
    keyvalues: { batchId: String(batchId), type: "lab_pdf" }
  }));

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: { Authorization: `Bearer ${PINATA_JWT}` },
    body: formData
  });
  if (!res.ok) throw new Error(`PDF upload failed: ${res.statusText}`);
  return (await res.json()).IpfsHash;
};

// ─── Upload batch metadata JSON → returns CID ──────────────────────────────
// This is what gets stored on-chain via createBatch(metadataCID)
export const uploadBatchMetadata = async ({ cropName, location, harvestDate, imageCID, farmerName }) => {
  const payload = {
    // Primary field names (used by our fetchBatchMetadata)
    name: cropName,
    cropName,          // redundant alias for compatibility
    location,
    farmLocation: location,  // alias for compatibility
    harvestDate,
    date: harvestDate,       // alias for compatibility
    imageCID,
    farmerName,
    createdAt: new Date().toISOString()
  };

  const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      pinataContent: payload,
      pinataMetadata: { name: `HerbTrace_Batch_${cropName}_${Date.now()}` }
    })
  });
  if (!res.ok) throw new Error(`Metadata upload failed: ${res.statusText}`);
  return (await res.json()).IpfsHash;
};

// ─── Fetch batch metadata JSON from IPFS by CID ────────────────────────────
// Handles multiple metadata formats (our Pinata JSON, Member 4's Java server JSON, etc.)
// Always returns a normalized object with: { name, location, harvestDate, imageCID, farmerName }
export const fetchBatchMetadata = async (metadataCID) => {
  if (!metadataCID || metadataCID === '') return null;
  const clean = metadataCID.replace('ipfs://', '').trim();

  // Try each gateway in order; stop at the first successful JSON response.
  for (const gw of METADATA_GATEWAYS) {
    try {
      const res = await fetch(`${gw}/${clean}`);
      if (!res.ok) continue;

      const contentType = res.headers.get('content-type') || '';
      // If the CID points directly to an image (not JSON), skip — no metadata
      if (contentType.includes('image') || contentType.includes('octet-stream')) return null;

      let raw;
      try { raw = await res.json(); } catch { continue; }

      // 🔍 DEBUG: log raw IPFS JSON so we can see actual field names from Member 1/4
      console.log('📦 IPFS Metadata raw:', JSON.stringify(raw, null, 2));

      // Member 1's IPFS JSON format: { image, name, description: "Harvested at {location} by {farmer}" }
      let parsedLocation = null;
      let parsedFarmer = null;
      if (raw.description) {
        const match = raw.description.match(/harvested at (.+?) by (.+)/i);
        if (match) { parsedLocation = match[1].trim(); parsedFarmer = match[2].trim(); }
      }

    // Normalize fields — handle different naming conventions from different team members
      const normalizedData = {
        name: raw.name || raw.cropName || raw.crop || raw.herbName || null,
        location: raw.location || raw.farmLocation || raw.farm_location
          || raw.farmAddress || raw.farm_address || raw.address
          || raw.village || raw.district || raw.state
          || raw.region || raw.place || raw.area
          || raw.city || raw.origin || parsedLocation || null,
        harvestDate: raw.harvestDate || raw.date || raw.harvest_date || raw.harvestdate || null,
        imageCID: raw.imageCID || raw.imagehash || raw.image_cid || raw.image || raw.imageHash || null,
        farmerName: raw.farmerName || raw.farmer_name || raw.farmer || parsedFarmer || null,
      };

      // ─── NESTED IMAGE CID FIX ─────────────────────────────────────────────
      // If the backend uploaded a JSON file instead of a raw image, and passed us THAT CID,
      // we need to fetch that secondary JSON and extract the actual image CID from it.
      if (normalizedData.imageCID) {
        try {
          const imgClean = normalizedData.imageCID.replace('ipfs://', '').trim();
          // Fast check on primary gateway only to avoid massive lag
          const imgRes = await fetch(`${METADATA_GATEWAYS[0]}/${imgClean}`);
          if (imgRes.ok) {
            const imgContentType = imgRes.headers.get('content-type') || '';
            // If it's JSON (not an image), unwrap it!
            if (imgContentType.includes('application/json') || imgContentType.includes('text/plain')) {
              const nestedJson = await imgRes.json();
              console.log('📦 Unwrap nested image JSON:', nestedJson);
              if (nestedJson.image) {
                normalizedData.imageCID = nestedJson.image.replace('ipfs://', '').trim();
              }
            }
          }
        } catch (nestErr) {
          console.warn('Failed to unwrap potentially nested imageCID:', nestErr);
        }
      }
      
      return normalizedData;
    } catch (e) {
      console.warn(`fetchBatchMetadata: gateway ${gw} failed for CID ${metadataCID}`, e);
    }
  }

  console.warn('fetchBatchMetadata: all gateways failed for CID:', metadataCID);
  return null;
};

// ─── Resolve an IPFS hash to a full URL ────────────────────────────────────
export const ipfsUrl = (cid) => {
  if (!cid || cid === "null" || cid === "") return null;
  const clean = String(cid).replace("ipfs://", "").trim();
  if (clean.startsWith("http")) return clean;
  return `${IPFS_GATEWAY}/${clean}`;
};