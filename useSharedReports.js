import { useState, useEffect, useRef, useCallback } from "react";
import { KEY_REPORTS } from "../utils/constants";

export function useSharedReports() {
  const [reports,   setReports]   = useState([]);
  const [connected, setConnected] = useState(false);
  const [lastSync,  setLastSync]  = useState(null);
  const [newAlert,  setNewAlert]  = useState(null);
  const prevCountRef = useRef(0);

  const load = useCallback(async () => {
    try {
      const res  = await window.storage.get(KEY_REPORTS, true);
      const data = res ? JSON.parse(res.value) : [];

      if (data.length > prevCountRef.current && prevCountRef.current > 0) {
        setNewAlert(data[0]);
        setTimeout(() => setNewAlert(null), 6000);
      }

      prevCountRef.current = data.length;
      setReports(data);
      setConnected(true);
      setLastSync(new Date());
    } catch {
      setConnected(false);
    }
  }, []);

  const save = useCallback(async (report) => {
    try {
      let current = [];
      try {
        const res = await window.storage.get(KEY_REPORTS, true);
        if (res) current = JSON.parse(res.value);
      } catch { /* first write */ }

      const next = [report, ...current];
      await window.storage.set(KEY_REPORTS, JSON.stringify(next), true);
      setReports(next);
      prevCountRef.current = next.length;
      setConnected(true);
      setLastSync(new Date());
    } catch {
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    load();
    const iv = setInterval(load, 2000);
    return () => clearInterval(iv);
  }, [load]);

  return { reports, save, connected, lastSync, newAlert };
}
