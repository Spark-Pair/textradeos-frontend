import { useMemo, useState } from "react";
import Table from "../../components/Table";
import Button from "../../components/Button";
import { useSync } from "../../context/SyncContext";
import axiosClient from "../../api/axiosClient";

const formatTs = (ts) => {
  if (!ts) return "-";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
};

const compactJson = (obj) => {
  if (!obj) return "-";
  const keys = Object.keys(obj);
  if (!keys.length) return "-";
  const pick = keys.slice(0, 6).reduce((acc, k) => {
    acc[k] = obj[k];
    return acc;
  }, {});
  return JSON.stringify(pick);
};

export default function SyncStatus() {
  const {
    outbox,
    status,
    currentItem,
    lastSyncAt,
    error,
    isOnline,
    runSync,
    discardItem,
    retryItem,
    discardAll,
    history,
    conflicts,
    resolveAsNew,
    forceOverwrite,
  } = useSync();

  const [selected, setSelected] = useState(null);
  const [serverVersion, setServerVersion] = useState(null);

  const pendingCount = outbox.length;
  const isSyncing = status === "syncing";

  const rows = useMemo(
    () =>
      outbox.map((item, idx) => ({
        ...item,
        _row: idx + 1,
        entity: item.store || item.endpoint || "action",
        action: item.action,
        target: item.targetId || item.payload?._id || "-",
        time: formatTs(item.timestamp),
        state:
          currentItem?.id === item.id
            ? isSyncing
              ? "Pushing"
              : "Failed"
            : item.status === "error"
              ? "Error"
              : "Pending",
        attempts: item.attempts || 0,
        nextRetry: item.nextRetryAt ? formatTs(item.nextRetryAt) : "-",
        lastError: item.lastError || "-",
        summary: compactJson(item.payload),
      })),
    [outbox, currentItem, isSyncing]
  );

  const historyRows = useMemo(
    () =>
      history.map((h, i) => ({
        ...h,
        _row: i + 1,
        time: formatTs(h.timestamp),
        state: h.status,
      })),
    [history]
  );

  const conflictRows = useMemo(
    () =>
      conflicts.map((c, i) => ({
        ...c,
        _row: i + 1,
        time: formatTs(c.timestamp),
      })),
    [conflicts]
  );

  const loadServerVersion = async (row) => {
    try {
      setServerVersion(null);
      if (!row?.endpoint || !row?.payload?._id) return;
      const res = await axiosClient.get(`${row.endpoint}/${row.payload._id}`);
      setServerVersion(res.data);
    } catch {
      setServerVersion(null);
    }
  };

  return (
    <div className="h-full overflow-hidden grid grid-rows-[auto_auto_1fr_auto] gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sync Status</h1>

        <div className="flex gap-2">
          <Button onClick={runSync} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {isSyncing ? "Syncing..." : "Retry Sync"}
          </Button>
          <Button onClick={discardAll} className="bg-red-600 hover:bg-red-700 text-white">
            Discard All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="border border-gray-300 rounded-2xl p-4 bg-white">
          <div className="text-xs uppercase text-gray-400 font-semibold">Connection</div>
          <div className={`text-lg font-bold ${isOnline ? "text-emerald-600" : "text-red-600"}`}>
            {isOnline ? "Online" : "Offline"}
          </div>
        </div>
        <div className="border border-gray-300 rounded-2xl p-4 bg-white">
          <div className="text-xs uppercase text-gray-400 font-semibold">Queue</div>
          <div className="text-lg font-bold text-gray-800">{pendingCount} Pending</div>
        </div>
        <div className="border border-gray-300 rounded-2xl p-4 bg-white">
          <div className="text-xs uppercase text-gray-400 font-semibold">Status</div>
          <div className={`text-lg font-bold ${status === "error" ? "text-red-600" : "text-gray-800"}`}>
            {status === "syncing" ? "Syncing" : status === "offline" ? "Offline" : status === "error" ? "Error" : "Idle"}
          </div>
        </div>
        <div className="border border-gray-300 rounded-2xl p-4 bg-white">
          <div className="text-xs uppercase text-gray-400 font-semibold">Last Sync</div>
          <div className="text-sm font-semibold text-gray-700">{formatTs(lastSyncAt)}</div>
          {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
        </div>
      </div>

      <Table
        columns={[
          { label: "#", field: "_row", width: "5%" },
          { label: "Entity", field: "entity", width: "12%", className: "capitalize" },
          { label: "Action", field: "action", width: "10%", className: "capitalize" },
          { label: "Target", field: "target", width: "14%" },
          { label: "State", field: "state", width: "8%" },
          { label: "Attempts", field: "attempts", width: "8%" },
          { label: "Next Retry", field: "nextRetry", width: "14%" },
          { label: "Time", field: "time", width: "14%" },
          { label: "Summary", field: "summary", width: "auto" },
          {
            label: "Actions",
            width: "14%",
            align: "center",
            render: (row) => (
              <div className="flex justify-center gap-2">
                <button
                  className="px-2.5 py-1 rounded-md text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    retryItem(row.id);
                  }}
                >
                  Retry
                </button>
                <button
                  className="px-2.5 py-1 rounded-md text-xs bg-red-50 text-red-700 hover:bg-red-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    discardItem(row.id);
                  }}
                >
                  Discard
                </button>
              </div>
            ),
          },
        ]}
        data={rows}
        onRowClick={(row) => setSelected(row)}
        emptyText="No pending changes. You're fully synced."
        height="52vh"
      />

      <div className="border border-gray-300 rounded-2xl p-4 bg-white">
        <div className="text-sm font-semibold text-gray-700 mb-2">Conflicts</div>
        <Table
          columns={[
            { label: "#", field: "_row", width: "5%" },
            { label: "Entity", field: "store", width: "14%" },
            { label: "Action", field: "action", width: "12%" },
            { label: "Status", field: "status", width: "10%" },
            { label: "Time", field: "time", width: "20%" },
            { label: "Endpoint", field: "endpoint", width: "auto" },
            {
              label: "Resolve",
              width: "18%",
              align: "center",
              render: (row) => (
                <div className="flex justify-center gap-2">
                  <button
                    className="px-2.5 py-1 rounded-md text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      retryItem(row.entryId);
                    }}
                  >
                    Retry
                  </button>
                  <button
                    className="px-2.5 py-1 rounded-md text-xs bg-amber-50 text-amber-700 hover:bg-amber-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      forceOverwrite(row.entryId);
                    }}
                  >
                    Force
                  </button>
                  <button
                    className="px-2.5 py-1 rounded-md text-xs bg-blue-50 text-blue-700 hover:bg-blue-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      resolveAsNew(row.entryId);
                    }}
                  >
                    Save as New
                  </button>
                  <button
                    className="px-2.5 py-1 rounded-md text-xs bg-red-50 text-red-700 hover:bg-red-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      discardItem(row.entryId);
                    }}
                  >
                    Discard
                  </button>
                </div>
              ),
            },
          ]}
          data={conflictRows}
          emptyText="No conflicts detected."
          height="30vh"
        />
      </div>

      <div className="border border-gray-300 rounded-2xl p-4 bg-white">
        <div className="text-sm font-semibold text-gray-700 mb-2">Sync History</div>
        <Table
          columns={[
            { label: "#", field: "_row", width: "5%" },
            { label: "Entity", field: "store", width: "16%" },
            { label: "Action", field: "action", width: "14%" },
            { label: "Status", field: "state", width: "10%" },
            { label: "Time", field: "time", width: "20%" },
            { label: "Endpoint", field: "endpoint", width: "auto" },
          ]}
          data={historyRows}
          emptyText="No sync history yet."
          height="36vh"
        />
      </div>

      <div className="border border-gray-300 rounded-2xl p-4 bg-white">
        <div className="text-sm font-semibold text-gray-700 mb-2">Selected Item</div>
        {!selected ? (
          <div className="text-gray-500 text-sm">Select a row to view details.</div>
        ) : (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Entity</div>
              <div className="font-semibold capitalize">{selected.entity}</div>
            </div>
            <div>
              <div className="text-gray-500">Action</div>
              <div className="font-semibold capitalize">{selected.action}</div>
            </div>
            <div>
              <div className="text-gray-500">Target</div>
              <div className="font-semibold">{selected.target}</div>
            </div>
            <div>
              <div className="text-gray-500">Queued At</div>
              <div className="font-semibold">{selected.time}</div>
            </div>
            <div className="col-span-2">
              <div className="text-gray-500">Payload</div>
              <pre className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-auto max-h-40">
{JSON.stringify(selected.payload, null, 2)}
              </pre>
            </div>
            <div className="col-span-2">
              <div className="text-gray-500">Server Version</div>
              <div className="mb-2">
                <button
                  className="px-2.5 py-1 rounded-md text-xs bg-gray-100 hover:bg-gray-200"
                  onClick={() => loadServerVersion(selected)}
                >
                  Load Server Version
                </button>
              </div>
              <pre className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-auto max-h-40">
{JSON.stringify(serverVersion, null, 2)}
              </pre>
            </div>
            <div className="col-span-2">
              <div className="text-gray-500">Last Error</div>
              <div className="text-sm text-red-600">{selected.lastError || "-"}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
