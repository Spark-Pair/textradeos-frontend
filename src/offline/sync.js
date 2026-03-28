import { dbPromise } from "./db";

const getMapKey = (store, id) => `idmap:${store}:${id}`;

const resolveId = async (store, id) => {
  if (!id || !String(id).startsWith("local-")) return id;
  const db = await dbPromise;
  const mapped = await db.get("meta", getMapKey(store, id));
  return mapped || id;
};

const mapId = async (store, localId, serverId) => {
  const db = await dbPromise;
  await db.put("meta", serverId, getMapKey(store, localId));
};

const resolveRefs = async (store, payload) => {
  const clone = JSON.parse(JSON.stringify(payload));

  if (!store) return clone;

  if (store === "payments") {
    clone.customerId = await resolveId("customers", clone.customerId);
  }

  if (store === "invoices") {
    clone.customerId = await resolveId("customers", clone.customerId);
    if (Array.isArray(clone.items)) {
      for (const item of clone.items) {
        item.articleId = await resolveId("articles", item.articleId);
      }
    }
  }

  if (store === "subscriptions") {
    clone.businessId = await resolveId("businesses", clone.businessId);
  }

  return clone;
};

export const syncOutbox = async (axiosClient, opts = {}) => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { ok: false, error: "offline" };
  }
  if (typeof localStorage !== "undefined" && !localStorage.getItem("token")) {
    return { ok: false, error: "no-auth" };
  }

  const db = await dbPromise;
  const outbox = await db.getAll("outbox");
  if (!outbox.length) return { ok: true };

  const now = Date.now();
  const ordered = outbox
    .filter((e) => !e.nextRetryAt || e.nextRetryAt <= now)
    .sort((a, b) => a.timestamp - b.timestamp);

  const callWithConfig = async (method, url, payload, config) => {
    if (method === "delete") {
      return axiosClient.delete(url, config);
    }
    return axiosClient[method](url, payload, config);
  };

  for (const entry of ordered) {
    try {
      if (opts.onItemStart) opts.onItemStart(entry);
      const config = entry.force
        ? { headers: { "x-force-overwrite": "1" }, params: { force: "true" } }
        : undefined;
      if (entry.action === "create") {
        const payload = await resolveRefs(entry.store, entry.payload);
        const localId = payload._id;
        const clean = { ...payload };
        delete clean._id;
        delete clean._offline;

        const { data } = await callWithConfig("post", entry.endpoint, clean, config);
        await mapId(entry.store, localId, data._id);

        await db.delete(entry.store, localId);
        await db.put(entry.store, data);
      }

      if (entry.action === "update") {
        const targetId = await resolveId(entry.store, entry.targetId);
        const payload = await resolveRefs(entry.store, entry.payload);
        const clean = { ...payload };
        delete clean._id;
        delete clean._offline;

        const { data } = await callWithConfig("put", `${entry.endpoint}/${targetId}`, clean, config);
        await db.put(entry.store, data);
      }

      if (entry.action === "patch") {
        const targetId = await resolveId(entry.store, entry.targetId);
        const payload = await resolveRefs(entry.store, entry.payload);
        const clean = { ...payload };
        delete clean._id;
        delete clean._offline;

        const { data } = await callWithConfig("patch", `${entry.endpoint}/${targetId}`, clean, config);
        if (entry.store) {
          await db.put(entry.store, data);
        }
      }

      if (entry.action === "delete") {
        const targetId = await resolveId(entry.store, entry.targetId);
        await callWithConfig("delete", `${entry.endpoint}/${targetId}`, null, config);
        await db.delete(entry.store, targetId);
      }

      if (entry.action === "request") {
        const payload = await resolveRefs(entry.store, entry.payload);
        const method = entry.method || "post";
        await callWithConfig(method, entry.endpoint, payload, config);
      }

      await db.delete("outbox", entry.id);
      await db.put("sync_logs", {
        id: `log-${entry.id}-${Date.now()}`,
        status: "success",
        action: entry.action,
        endpoint: entry.endpoint,
        store: entry.store,
        timestamp: Date.now(),
      });
      if (opts.onItemDone) opts.onItemDone(entry);
    } catch (err) {
      if (opts.onError) opts.onError(entry, err);
      const statusCode = err?.response?.status;
      const isConflict = [409, 412, 404].includes(statusCode);
      if (isConflict) {
        await db.put("outbox", {
          ...entry,
          status: "conflict",
          lastError: err?.message || "conflict",
          conflictStatus: statusCode,
          nextRetryAt: null,
        });
        await db.put("conflicts", {
          id: `conf-${entry.id}`,
          entryId: entry.id,
          status: statusCode,
          message: err?.message || "conflict",
          endpoint: entry.endpoint,
          store: entry.store,
          action: entry.action,
          payload: entry.payload,
          timestamp: Date.now(),
        });
        await db.put("sync_logs", {
          id: `log-${entry.id}-${Date.now()}`,
          status: "conflict",
          action: entry.action,
          endpoint: entry.endpoint,
          store: entry.store,
          error: err?.message || "conflict",
          timestamp: Date.now(),
        });
        return { ok: false, error: "conflict" };
      }

      const attempts = (entry.attempts || 0) + 1;
      const backoffMs = Math.min(60 * 1000 * Math.pow(2, attempts), 30 * 60 * 1000);
      await db.put("outbox", {
        ...entry,
        attempts,
        status: "error",
        lastError: err?.message || "sync-failed",
        nextRetryAt: Date.now() + backoffMs,
      });
      await db.put("sync_logs", {
        id: `log-${entry.id}-${Date.now()}`,
        status: "error",
        action: entry.action,
        endpoint: entry.endpoint,
        store: entry.store,
        error: err?.message || "sync-failed",
        timestamp: Date.now(),
      });
      return { ok: false, error: err?.message || "sync-failed" };
    }
  }
  if (opts.onComplete) opts.onComplete();
  return { ok: true };
};
