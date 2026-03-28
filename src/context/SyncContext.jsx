import { createContext, useContext, useEffect, useMemo, useState } from "react";
import axiosClient from "../api/axiosClient";
import { dbPromise } from "../offline/db";
import { syncOutbox } from "../offline/sync";

const SyncContext = createContext();

export const SyncProvider = ({ children }) => {
  const [outbox, setOutbox] = useState([]);
  const [history, setHistory] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | syncing | error | offline
  const [currentItem, setCurrentItem] = useState(null);
  const [lastSyncAt, setLastSyncAt] = useState(null);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  const refreshOutbox = async () => {
    const db = await dbPromise;
    const items = await db.getAll("outbox");
    setOutbox(items.sort((a, b) => a.timestamp - b.timestamp));
  };

  const refreshHistory = async () => {
    const db = await dbPromise;
    const items = await db.getAll("sync_logs");
    setHistory(items.sort((a, b) => b.timestamp - a.timestamp).slice(0, 200));
  };

  const refreshConflicts = async () => {
    const db = await dbPromise;
    const items = await db.getAll("conflicts");
    setConflicts(items.sort((a, b) => b.timestamp - a.timestamp));
  };

  const runSync = async () => {
    if (!isOnline) {
      setStatus("offline");
      return;
    }
    setStatus("syncing");
    setError(null);
    const result = await syncOutbox(axiosClient, {
      onItemStart: (item) => setCurrentItem(item),
      onItemDone: () => setCurrentItem(null),
      onError: (item, err) => {
        setCurrentItem(item);
        setError(err?.message || "Sync failed");
      },
    });
    await refreshOutbox();
    await refreshHistory();
    await refreshConflicts();
    if (result?.ok) {
      setStatus("idle");
      setLastSyncAt(new Date());
    } else if (result?.error === "offline" || result?.error === "no-auth") {
      setStatus("offline");
    } else {
      setStatus("error");
    }
  };

  const discardItem = async (id) => {
    const db = await dbPromise;
    await db.delete("outbox", id);
    await refreshOutbox();
  };

  const retryItem = async (id) => {
    const db = await dbPromise;
    const item = await db.get("outbox", id);
    if (!item) return;
    await db.put("outbox", {
      ...item,
      status: "pending",
      lastError: null,
      nextRetryAt: Date.now(),
    });
    await db.delete("conflicts", `conf-${id}`);
    await refreshOutbox();
    runSync();
  };

  const forceOverwrite = async (id) => {
    const db = await dbPromise;
    const item = await db.get("outbox", id);
    if (!item) return;
    await db.put("outbox", {
      ...item,
      force: true,
      status: "pending",
      lastError: null,
      nextRetryAt: Date.now(),
    });
    await db.delete("conflicts", `conf-${id}`);
    await refreshOutbox();
    runSync();
  };

  const resolveAsNew = async (id) => {
    const db = await dbPromise;
    const item = await db.get("outbox", id);
    if (!item) return;
    const newId = `local-${crypto.randomUUID()}`;
    const payload = { ...(item.payload || {}), _id: newId, _offline: true };
    await db.put(item.store, payload);
    await db.put("outbox", {
      ...item,
      id: `q-${crypto.randomUUID()}`,
      action: "create",
      targetId: null,
      status: "pending",
      lastError: null,
      nextRetryAt: Date.now(),
      payload,
      timestamp: Date.now(),
    });
    await db.delete("outbox", id);
    await db.delete("conflicts", `conf-${id}`);
    await refreshOutbox();
    await refreshConflicts();
    runSync();
  };

  const discardAll = async () => {
    const db = await dbPromise;
    const tx = db.transaction("outbox", "readwrite");
    await tx.objectStore("outbox").clear();
    await tx.done;
    await refreshOutbox();
  };

  useEffect(() => {
    refreshOutbox();
    refreshHistory();
    refreshConflicts();
    if (typeof navigator !== "undefined" && navigator.onLine) {
      runSync();
    } else {
      setStatus("offline");
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      runSync();
    };
    const handleOffline = () => {
      setIsOnline(false);
      setStatus("offline");
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    const interval = setInterval(() => {
      if (navigator.onLine) runSync();
    }, 120000);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, [isOnline]);

  const value = useMemo(
    () => ({
      outbox,
      status,
      currentItem,
      lastSyncAt,
      error,
      isOnline,
      refreshOutbox,
      runSync,
      discardItem,
      retryItem,
      forceOverwrite,
      discardAll,
      history,
      refreshHistory,
      conflicts,
      resolveAsNew,
      refreshConflicts,
    }),
    [outbox, status, currentItem, lastSyncAt, error, isOnline, history, conflicts]
  );

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
};

export const useSync = () => useContext(SyncContext);
