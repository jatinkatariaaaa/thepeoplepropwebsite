import { createHash } from "node:crypto";

/** A purchase, progression or reset must address the same CRM and terminal on every retry. */
export function issuanceId(kind: "purchase" | "phase" | "reset", source: string, phase = "") {
  const namespace = Buffer.from("db307ed5ddd1471882ec037d4f588c69","hex");
  const bytes = createHash("sha1").update(namespace).update(`${kind}/${source}/${phase}`).digest();
  bytes[6] = (bytes[6] & 15) | 0x50;
  bytes[8] = (bytes[8] & 63) | 0x80;
  const hex = bytes.subarray(0,16).toString("hex");
  return [hex.slice(0,8),hex.slice(8,12),hex.slice(12,16),hex.slice(16,20),hex.slice(20)].join("-");
}
