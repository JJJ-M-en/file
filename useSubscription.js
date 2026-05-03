import { useState, useCallback, useEffect } from "react";
import { KEY_SUBSCRIPTION, PAYMENT_CONFIG } from "../utils/constants";
import { getSubscriptionStatus } from "../utils/helpers";

export function useSubscription() {
  const [subscription, setSubscription] = useState(null);

  const loadSub = useCallback(async () => {
    try {
      const res = await window.storage.get(KEY_SUBSCRIPTION, true);
      if (res) {
        setSubscription(JSON.parse(res.value));
      } else {
        // First visit → start free trial automatically
        const trial = {
          status:      "trial",
          trialStart:  Date.now(),
          lastPayment: null,
          payments:    [],
          aiAnalysis:  [],
        };
        await window.storage.set(KEY_SUBSCRIPTION, JSON.stringify(trial), true);
        setSubscription(trial);
      }
    } catch { /* storage unavailable */ }
  }, []);

  const saveSub = useCallback(async (next) => {
    setSubscription(next);
    try {
      await window.storage.set(KEY_SUBSCRIPTION, JSON.stringify(next), true);
    } catch { /* offline */ }
  }, []);

  // Called by AI verifier after approval
  const registerPayment = useCallback(async (reference) => {
    let current = { payments: [], aiAnalysis: [] };
    try {
      const res = await window.storage.get(KEY_SUBSCRIPTION, true);
      if (res) current = JSON.parse(res.value);
    } catch { /* use empty */ }

    const updated = {
      ...current,
      status:      "active",
      lastPayment: Date.now(),
      payments: [
        ...(current.payments || []),
        {
          date:      new Date().toLocaleString("es-CO"),
          amount:    PAYMENT_CONFIG.monthlyFee,
          reference,
          timestamp: Date.now(),
        },
      ],
    };
    await saveSub(updated);
    return updated;
  }, [saveSub]);

  const suspendService = useCallback(async () => {
    let current = {};
    try {
      const res = await window.storage.get(KEY_SUBSCRIPTION, true);
      if (res) current = JSON.parse(res.value);
    } catch { /* use empty */ }
    await saveSub({ ...current, status: "suspended" });
  }, [saveSub]);

  useEffect(() => { loadSub(); }, [loadSub]);

  // AI monitor: auto-suspend when trial or pay period expires
  useEffect(() => {
    const check = async () => {
      try {
        const res = await window.storage.get(KEY_SUBSCRIPTION, true);
        if (!res) return;
        const sub    = JSON.parse(res.value);
        const status = getSubscriptionStatus(sub);
        if (status === "payment_due" || status === "trial_expired") {
          const updated = { ...sub, status: "suspended" };
          await window.storage.set(KEY_SUBSCRIPTION, JSON.stringify(updated), true);
          setSubscription(updated);
        }
      } catch { /* skip */ }
    };
    const iv = setInterval(check, 30_000);
    return () => clearInterval(iv);
  }, []);

  return { subscription, saveSub, registerPayment, suspendService };
}
