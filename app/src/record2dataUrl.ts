import { strToBase64 } from "@root/encoding";

export function record2dataUrl(data: object, mimeType = "application/json") {
  const bj = strToBase64(JSON.stringify(data, null, 4));
  return `data:${mimeType};base64,${bj}`;
}
