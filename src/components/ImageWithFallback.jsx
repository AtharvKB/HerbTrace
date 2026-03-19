import React, { useState, useEffect, useRef } from 'react';
import { ImageOff, Loader2 } from 'lucide-react';
import { pinCidByHash } from '../utils/pinata';

/**
 * IPFS gateway priority list — only actively maintained gateways.
 * Pinata is first since all our files are pinned directly there.
 * NOTE: cloudflare-ipfs.com was shut down in 2023 and must NOT be used.
 */
const GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://w3s.link/ipfs/',
  'https://nftstorage.link/ipfs/',
  'https://dweb.link/ipfs/',
  'https://ipfs.io/ipfs/',
];

/** Strip common IPFS prefixes to get a bare CID. */
const cleanCid = (raw) => {
  if (!raw) return null;
  let s = String(raw).trim();
  if (s.startsWith('ipfs://')) s = s.slice(7);
  if (s.startsWith('/ipfs/')) s = s.slice(6);
  return s || null;
};

/**
 * ImageWithFallback
 *
 * Tries each IPFS gateway in sequence (index-based, no string heuristics).
 * If ALL gateways fail (CID not yet in our Pinata account / not propagated):
 *   1. Calls Pinata "pinByHash" to queue our account to fetch & pin the CID.
 *   2. Waits 6 seconds, then retries the Pinata gateway once.
 *   3. If still unavailable, shows "Image unavailable".
 *
 * Props:
 *  ipfsHash  – raw CID, ipfs:// URI, /ipfs/... path, or full https URL
 *  alt       – alt text for the img element
 *  className – forwarded to the wrapper div (default: "")
 */
const ImageWithFallback = ({ ipfsHash, alt, className = '' }) => {
  const [gatewayIndex, setGatewayIndex] = useState(0);
  const [src, setSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [pinning, setPinning] = useState(false);  // true while waiting for pinByHash
  const pinAttempted = useRef(false);             // only pin once per CID

  const initImage = (hash) => {
    const cid = cleanCid(hash);
    if (!cid || cid === 'null') { setFailed(true); setLoading(false); return; }

    if (cid.startsWith('http')) {
      setSrc(cid);
      setGatewayIndex(-1); // direct URL, no gateway rotation
    } else {
      setSrc(`${GATEWAYS[0]}${cid}`);
      setGatewayIndex(0);
    }
    setLoading(true);
    setFailed(false);
    setPinning(false);
  };

  useEffect(() => {
    pinAttempted.current = false;
    initImage(ipfsHash);
  }, [ipfsHash]);

  const handleError = async () => {
    const cid = cleanCid(ipfsHash);

    // Direct URL — nothing to fall back to.
    if (gatewayIndex === -1) { setFailed(true); setLoading(false); return; }

    const next = gatewayIndex + 1;
    if (next < GATEWAYS.length) {
      // Try next gateway in the list.
      setSrc(`${GATEWAYS[next]}${cid}`);
      setGatewayIndex(next);
      setLoading(true);
      return;
    }

    // ── All gateways exhausted ─────────────────────────────────────────────
    // If we haven't pinned yet, queue Pinata to fetch & pin this CID,
    // then retry the Pinata gateway after a short wait.
    if (!pinAttempted.current) {
      pinAttempted.current = true;
      setPinning(true);
      const queued = await pinCidByHash(cid);
      if (queued) {
        // Give Pinata ~6 s to start fetching the CID, then retry gateway 0.
        setTimeout(() => {
          setSrc(`${GATEWAYS[0]}${cid}?retry=1`);
          setGatewayIndex(0);
          setLoading(true);
          setPinning(false);
        }, 6000);
      } else {
        // pinByHash itself failed — give up.
        setPinning(false);
        setFailed(true);
        setLoading(false);
      }
      return;
    }

    // pinByHash retry also failed → give up.
    setFailed(true);
    setLoading(false);
    setPinning(false);
  };

  const handleLoad = () => setLoading(false);

  if (failed) {
    return (
      <div className={`w-full h-full bg-stone-100 flex flex-col items-center justify-center text-stone-400 gap-2 ${className}`}>
        <ImageOff size={32} className="opacity-40" />
        <span className="text-[11px] text-stone-400 text-center px-4 font-medium">Image unavailable</span>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      {(loading || pinning) && (
        <div className="absolute inset-0 bg-stone-100 flex flex-col items-center justify-center gap-2 animate-pulse">
          <Loader2 className="w-6 h-6 animate-spin text-stone-300" />
          {pinning && (
            <span className="text-[10px] text-stone-400 font-medium">Pinning to IPFS…</span>
          )}
        </div>
      )}
      {src && (
        <img
          key={src}
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
        />
      )}
    </div>
  );
};

export default ImageWithFallback;
