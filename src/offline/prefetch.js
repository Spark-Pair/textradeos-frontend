import { dbPromise } from "./db";

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

export const prefetchAllData = async ({ axiosClient, role, bizId }) => {
  const tasks = [];

  if (role === "developer") {
    tasks.push(
      axiosClient.get("/businesses/").then((res) => putAll("businesses", res.data)).catch(() => {})
    );
    tasks.push(
      axiosClient.get("/subscriptions/").then((res) => putAll("subscriptions", res.data)).catch(() => {})
    );
  }

  if (role === "user") {
    tasks.push(
      axiosClient.get("/customers/").then((res) => putAll("customers", res.data, bizId)).catch(() => {})
    );
    tasks.push(
      axiosClient.get("/articles/").then((res) => putAll("articles", res.data, bizId)).catch(() => {})
    );
    tasks.push(
      axiosClient.get("/invoices/").then((res) => putAll("invoices", res.data, bizId)).catch(() => {})
    );
    tasks.push(
      axiosClient.get("/payments/").then((res) => putAll("payments", res.data, bizId)).catch(() => {})
    );
  }

  await Promise.all(tasks);
};
