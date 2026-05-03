import { useState, useCallback, useEffect } from "react";
import { KEY_USERS, INIT_USERS } from "./constants";

export function useSharedUsers() {
  const [users, setUsersState] = useState(INIT_USERS);

  const loadUsers = useCallback(async () => {
    try {
      const res = await window.storage.get(KEY_USERS, true);
      if (res) setUsersState(JSON.parse(res.value));
    } catch { /* use defaults */ }
  }, []);

  const saveUsers = useCallback(async (next) => {
    setUsersState(next);
    try {
      await window.storage.set(KEY_USERS, JSON.stringify(next), true);
    } catch { /* offline */ }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  return { users, saveUsers };
}
