import { createPublicKey, verify as verifySignature } from "node:crypto";

const JWKS_TTL_MS = 5 * 60 * 1000;
let jwksCache = { keys: [], expiresAt: 0 };

function authBaseUrl() {
  const value = process.env.AUTH_URL || process.env.NEON_AUTH_BASE_URL;
  if (!value) throw new Error("Neon Auth URL is not configured.");
  return value.replace(/\/+$/, "");
}

function decodeJson(segment) {
  return JSON.parse(Buffer.from(segment, "base64url").toString("utf8"));
}

async function getSigningKeys() {
  if (jwksCache.expiresAt > Date.now() && jwksCache.keys.length) return jwksCache.keys;

  const baseUrl = authBaseUrl();
  const jwksUrl = process.env.NEON_AUTH_JWKS_URL
    || new URL(".well-known/jwks.json", `${baseUrl}/`).toString();
  const response = await fetch(jwksUrl, { signal: AbortSignal.timeout(5000), cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load Neon Auth signing keys.");

  const data = await response.json();
  if (!Array.isArray(data.keys) || !data.keys.length) throw new Error("Neon Auth returned no signing keys.");
  jwksCache = { keys: data.keys, expiresAt: Date.now() + JWKS_TTL_MS };
  return jwksCache.keys;
}

/** Verify a Neon Managed Auth access token against the branch's public JWKS. */
export async function verifyNeonAuthToken(token) {
  if (typeof token !== "string" || token.length > 16_384) return null;
  const [encodedHeader, encodedPayload, encodedSignature, extra] = token.split(".");
  if (!encodedHeader || !encodedPayload || !encodedSignature || extra !== undefined) return null;

  try {
    const header = decodeJson(encodedHeader);
    const claims = decodeJson(encodedPayload);
    if (header.alg !== "EdDSA" || typeof header.kid !== "string") return null;

    const keys = await getSigningKeys();
    const jwk = keys.find((key) => key.kid === header.kid && key.kty === "OKP" && key.crv === "Ed25519");
    if (!jwk) return null;

    const publicKey = createPublicKey({ key: jwk, format: "jwk" });
    const signature = Buffer.from(encodedSignature, "base64url");
    const signedContent = Buffer.from(`${encodedHeader}.${encodedPayload}`, "utf8");
    if (!verifySignature(null, signedContent, publicKey, signature)) return null;

    const issuer = new URL(authBaseUrl()).origin;
    const now = Math.floor(Date.now() / 1000);
    if (claims.iss !== issuer || claims.aud !== issuer) return null;
    if (!Number.isFinite(claims.exp) || claims.exp <= now) return null;
    if (Number.isFinite(claims.nbf) && claims.nbf > now) return null;
    if (typeof claims.sub !== "string" || !claims.sub) return null;
    return claims;
  } catch {
    return null;
  }
}
