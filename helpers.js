import { ST, PAYMENT_CONFIG } from "./constants";

export const getST = (v) => ST.find((s) => s.value === v) || ST[0];

export const calcOverall = (checks) => {
  const v = Object.values(checks);
  return v.includes("falla") ? "falla" : v.includes("revision") ? "revision" : "ok";
};

export function getSubscriptionStatus(sub) {
  if (!sub) return "none";
  const now = Date.now();
  if (sub.status === "trial") {
    const trialEnd = sub.trialStart + PAYMENT_CONFIG.trialDays * 86400000;
    return now < trialEnd ? "trial" : "trial_expired";
  }
  if (sub.status === "active") {
    const nextPayment = sub.lastPayment + 30 * 86400000;
    return now < nextPayment ? "active" : "payment_due";
  }
  if (sub.status === "suspended") return "suspended";
  return "none";
}

export function daysLeft(sub) {
  if (!sub) return 0;
  const now = Date.now();
  if (sub.status === "trial") {
    const trialEnd = sub.trialStart + PAYMENT_CONFIG.trialDays * 86400000;
    return Math.max(0, Math.ceil((trialEnd - now) / 86400000));
  }
  if (sub.status === "active") {
    const nextPayment = sub.lastPayment + 30 * 86400000;
    return Math.max(0, Math.ceil((nextPayment - now) / 86400000));
  }
  return 0;
}
