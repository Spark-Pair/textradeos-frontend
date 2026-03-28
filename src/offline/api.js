import { dbPromise } from "./db";

const isOnline = () => typeof navigator !== "undefined" && navigator.onLine;

const nowIso = () => new Date().toISOString();

const tempId = () => `local-${crypto.randomUUID()}`;

const getAll = async (store) => {
  const db = await dbPromise;
  return db.getAll(store);
};

const extractBizId = (item) => {
  if (!item) return null;
  const raw = item.businessId;
  if (typeof raw === "string") return raw;
  return raw?._id || null;
};

const putAll = async (store, items, bizId) => {
  const db = await dbPromise;
  const tx = db.transaction(store, "readwrite");
  const os = tx.objectStore(store);
  if (!bizId) {
    await os.clear();
  }
  for (const item of items) {
    const itemBizId = extractBizId(item) || bizId || item._bizId || null;
    await os.put({ ...item, _bizId: itemBizId });
  }
  await tx.done;
};

const upsert = async (store, item) => {
  const db = await dbPromise;
  await db.put(store, item);
};

const remove = async (store, id) => {
  const db = await dbPromise;
  await db.delete(store, id);
};

const enqueue = async (entry) => {
  const db = await dbPromise;
  await db.put("outbox", {
    attempts: 0,
    status: "pending",
    nextRetryAt: Date.now(),
    lastError: null,
    ...entry,
  });
};

export const getMeta = async (key) => {
  const db = await dbPromise;
  return db.get("meta", key);
};

export const setMeta = async (key, value) => {
  const db = await dbPromise;
  await db.put("meta", value, key);
};

export const getStatementCache = async (key) => {
  const db = await dbPromise;
  return db.get("statements", key);
};

export const setStatementCache = async (key, value) => {
  const db = await dbPromise;
  await db.put("statements", value, key);
};

export const getExportCache = async (key) => {
  const db = await dbPromise;
  return db.get("exports", key);
};

export const setExportCache = async (key, value) => {
  const db = await dbPromise;
  await db.put("exports", value, key);
};

export const loadCachedThenNetwork = async ({
  store,
  endpoint,
  axiosClient,
  params,
  onCache,
  bizId,
}) => {
  const cachedAll = await getAll(store);
  const cached = bizId
    ? cachedAll.filter((i) => (i._bizId || extractBizId(i)) === bizId)
    : cachedAll;
  if (onCache) onCache(cached);

  if (!isOnline()) return cached;

  const { data } = await axiosClient.get(endpoint, { params });
  const list = Array.isArray(data) ? data : data.data || [];
  await putAll(store, list, bizId);
  return bizId ? list.filter((i) => (extractBizId(i) || bizId) === bizId) : list;
};

export const createItem = async ({
  store,
  endpoint,
  axiosClient,
  payload,
  bizId,
  responseSelector,
}) => {
  if (isOnline()) {
    const { data } = await axiosClient.post(endpoint, payload);
    const selected = responseSelector ? responseSelector(data) : data;
    await upsert(store, { ...selected, _bizId: extractBizId(selected) || bizId || null });
    return selected;
  }

  const local = {
    ...payload,
    _id: tempId(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
    _offline: true,
    _bizId: bizId || extractBizId(payload) || null,
  };
  await upsert(store, local);
  await enqueue({
    id: tempId(),
    action: "create",
    store,
    endpoint,
    payload: local,
    timestamp: Date.now(),
  });
  return local;
};

export const updateItem = async ({
  store,
  endpoint,
  axiosClient,
  id,
  payload,
  bizId,
  responseSelector,
}) => {
  if (isOnline()) {
    const { data } = await axiosClient.put(`${endpoint}/${id}`, payload);
    const selected = responseSelector ? responseSelector(data) : data;
    await upsert(store, { ...selected, _bizId: extractBizId(selected) || bizId || null });
    return selected;
  }

  const db = await dbPromise;
  const existing = await db.get(store, id);
  const local = {
    ...(existing || {}),
    ...payload,
    _id: id,
    updatedAt: nowIso(),
    _offline: true,
    _bizId: bizId || existing?._bizId || extractBizId(existing) || null,
  };
  await upsert(store, local);
  await enqueue({
    id: tempId(),
    action: "update",
    store,
    endpoint,
    payload: local,
    targetId: id,
    timestamp: Date.now(),
  });
  return local;
};

export const patchItem = async ({ store, endpoint, axiosClient, id, payload }) => {
  if (isOnline()) {
    const { data } = await axiosClient.patch(`${endpoint}/${id}`, payload);
    await upsert(store, data);
    return data;
  }

  const db = await dbPromise;
  const existing = await db.get(store, id);
  const local = {
    ...(existing || {}),
    ...payload,
    _id: id,
    updatedAt: nowIso(),
    _offline: true,
  };
  await upsert(store, local);
  await enqueue({
    id: tempId(),
    action: "patch",
    store,
    endpoint,
    payload: local,
    targetId: id,
    timestamp: Date.now(),
  });
  return local;
};

export const postAction = async ({ endpoint, axiosClient, payload, optimistic, method = "post" }) => {
  if (isOnline()) {
    const { data } = await axiosClient[method](endpoint, payload);
    return data;
  }

  if (optimistic) {
    await optimistic();
  }
  await enqueue({
    id: tempId(),
    action: "request",
    endpoint,
    payload,
    method,
    timestamp: Date.now(),
  });
  return { queued: true };
};

export const deleteItem = async ({ store, endpoint, axiosClient, id }) => {
  if (isOnline()) {
    await axiosClient.delete(`${endpoint}/${id}`);
    await remove(store, id);
    return;
  }

  await remove(store, id);
  await enqueue({
    id: tempId(),
    action: "delete",
    store,
    endpoint,
    targetId: id,
    timestamp: Date.now(),
  });
};
