import { AMOUNT_IN_PAISE, SUCCESS_STATUSES } from "./constants";
import type { RequestResult } from "./types";

export const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export const txMoney = (value: number) => money(AMOUNT_IN_PAISE ? value / 100 : value);

export function txStatusClass(status: string) {
  if (SUCCESS_STATUSES.includes(status)) return "bg-[#eef2e7] text-[#61764a]";
  if (status === "failed") return "bg-[#fbefeb] text-[#a44d36]";
  if (status === "refunded") return "bg-[#e6eef0] text-[#52798b]";
  return "bg-[#f3edda] text-[#9c8247]";
}

export const formatDateTime = (value: string | null) =>
  value ? new Date(value).toLocaleString("en-IN") : "—";

export function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function requestJson<T>(url: string, init?: RequestInit): Promise<RequestResult<T>> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  // Read the response safely and show the API's actual validation message when available.
  const raw = await response.text();
  type Parsed = RequestResult<T> & { message?: string; details?: unknown; issues?: unknown };
  let result: Parsed;
  try {
    result = (raw ? JSON.parse(raw) : {}) as Parsed;
  } catch {
    result = {} as Parsed;
  }

  if (!response.ok) {
    const details = result.details ?? result.issues;
    const detailText =
      typeof details === "string" ? details : details ? JSON.stringify(details) : "";
    const message =
      result.error ||
      result.message ||
      detailText ||
      (raw && !raw.startsWith("<") ? raw.slice(0, 300) : "") ||
      `Request failed (${response.status}). Please check the product details.`;
    throw new Error(message);
  }
  return result;
}
