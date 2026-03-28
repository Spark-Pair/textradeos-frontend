import { openDB } from "idb";

const DB_NAME = "textradeos";
const DB_VERSION = 4;

export const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    const stores = [
      "businesses",
      "customers",
      "articles",
      "invoices",
      "payments",
      "subscriptions",
      "statements",
      "exports",
      "outbox",
      "sync_logs",
      "conflicts",
      "meta",
    ];

    for (const name of stores) {
      if (!db.objectStoreNames.contains(name)) {
        if (name === "outbox") {
          db.createObjectStore(name, { keyPath: "id" });
        } else if (name === "sync_logs") {
          db.createObjectStore(name, { keyPath: "id" });
        } else if (name === "conflicts") {
          db.createObjectStore(name, { keyPath: "id" });
        } else if (name === "meta") {
          db.createObjectStore(name);
        } else if (name === "statements") {
          db.createObjectStore(name);
        } else if (name === "exports") {
          db.createObjectStore(name);
        } else {
          db.createObjectStore(name, { keyPath: "_id" });
        }
      }
    }
  },
});

export const getStore = async (storeName, mode = "readonly") => {
  const db = await dbPromise;
  return db.transaction(storeName, mode).objectStore(storeName);
};
