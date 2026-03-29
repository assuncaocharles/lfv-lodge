import { createHmac } from "crypto";

function getSecret() {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error("BETTER_AUTH_SECRET not set");
  return secret;
}

export function createFeedToken(userId: string, orgId: string, grau: string): string {
  const payload = `${userId}:${orgId}:${grau}`;
  const sig = createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex")
    .slice(0, 16);
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

export function verifyFeedToken(token: string): {
  userId: string;
  orgId: string;
  grau: "1" | "2" | "3";
} | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString();
    const parts = decoded.split(":");
    if (parts.length !== 4) return null;

    const [userId, orgId, grau, sig] = parts;
    const expected = createHmac("sha256", getSecret())
      .update(`${userId}:${orgId}:${grau}`)
      .digest("hex")
      .slice(0, 16);

    if (sig !== expected) return null;

    return { userId, orgId, grau: grau as "1" | "2" | "3" };
  } catch {
    return null;
  }
}
