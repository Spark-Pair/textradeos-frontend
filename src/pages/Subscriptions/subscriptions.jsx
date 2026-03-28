import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import AddSubscriptionModal from "../../components/Subscriptions/AddSubscriptionModal";
import SubscriptionDetailsModal from "../../components/Subscriptions/SubscriptionDetailsModal";
import Table from "../../components/Table";
import axiosClient from "../../api/axiosClient";
import { loadCachedThenNetwork, createItem, updateItem, deleteItem, postAction } from "../../offline/api";
import { formatDateWithDay } from "../../utils/index";
import { useToast } from "../../context/ToastContext";
import { Plus } from "lucide-react";
import Filters from "../../components/Filters";
import PrintListBtn from "../../components/PrintListBtn";
import { dbPromise } from "../../offline/db";
import Pagination from "../../components/Pagination";
import { useAuth } from "../../context/AuthContext";

export default function Subscriptions() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [editingSubscription, setEditingSubscription] = useState(null);

  const [subscriptions, setSubscriptions] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filtersActive, setFiltersActive] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    document.title = "Subscriptions | TexTradeOS";
    loadSubscriptions();
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    try {
      const data = await loadCachedThenNetwork({
        store: "businesses",
        endpoint: "/businesses",
        axiosClient,
        onCache: (cached) => setBusinesses(cached),
      });
      setBusinesses(data);
    } catch (err) {
      console.error("Failed to load businesses:", err);
    }
  };

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await loadCachedThenNetwork({
        store: "subscriptions",
        endpoint: "/subscriptions/",
        axiosClient,
        bizId: user?.businessId?._id || user?.businessId || null,
        onCache: (cached) => {
          const cachedFormatted = cached.map((sub) => ({
            ...sub,
            businessName: sub.businessId?.name || "-",
            startDateFormatted: formatDateWithDay(sub.startDate),
            endDateFormatted: formatDateWithDay(sub.endDate),
          }));
          setSubscriptions(cachedFormatted);
          setLoading(false);
        },
      });
      const formatted = data.map((sub) => ({
        ...sub,
        businessName: sub.businessId?.name || "-",
        startDateFormatted: formatDateWithDay(sub.startDate),
        endDateFormatted: formatDateWithDay(sub.endDate),
      }));
      setSubscriptions(formatted);
    } catch (error) {
      console.error("Failed to load subscriptions:", error);
      addToast("Failed to load subscriptions", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdateSubscription = async (formData) => {
    try {
      if (editingSubscription) {
        // Update existing
        await updateItem({
          store: "subscriptions",
          endpoint: "/subscriptions",
          axiosClient,
          id: editingSubscription._id,
          payload: formData,
          bizId: user?.businessId?._id || user?.businessId || null,
        });
      } else {
        // Create new
        await createItem({
          store: "subscriptions",
          endpoint: "/subscriptions",
          axiosClient,
          payload: formData,
          bizId: user?.businessId?._id || user?.businessId || null,
        });
      }
      await loadSubscriptions();
      setIsModalOpen(false);
      setEditingSubscription(null);
    } catch (error) {
      console.error("Failed to save subscription:", error);
      addToast(error.response?.data?.message || "Failed to save subscription", "error");
    }
  };

  const handleDelete = async (sub) => {
    if (!window.confirm(`Delete subscription for ${sub.businessName}?`)) return;
    try {
      await deleteItem({
        store: "subscriptions",
        endpoint: "/subscriptions",
        axiosClient,
        id: sub._id,
      });
      await loadSubscriptions();
    } catch (error) {
      console.error("Failed to delete subscription:", error);
      addToast("Failed to delete subscription", "error");
    }
  };

  const handleEdit = (sub) => {
    setEditingSubscription(sub);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (sub) => {
    try {
      await postAction({
        endpoint: `/subscriptions/${sub._id}/toggle`,
        axiosClient,
        payload: {},
        method: "patch",
        optimistic: async () => {
          const next = subscriptions.map((s) =>
            s._id === sub._id
              ? {
                  ...s,
                  paymentStatus: s.paymentStatus === "paid" ? "unpaid" : "paid",
                }
              : s
          );
          setSubscriptions(next);
          const db = await dbPromise;
          const item = await db.get("subscriptions", sub._id);
          if (item) {
            await db.put("subscriptions", {
              ...item,
              paymentStatus: item.paymentStatus === "paid" ? "unpaid" : "paid",
            });
          }
        },
      });
      await loadSubscriptions();
      setSelectedSubscription(null);
    } catch (error) {
      console.error("Failed to change status:", error);
      addToast("Failed to change status", "error");
    }
  };

  const columns = [
    { label: "#", render: (_, i) => i + 1, width: "3%" },
    { label: "Business", field: "businessName", width: "auto" },
    { label: "Type", field: "type", width: "10%", align: "center" },
    { label: "Price", field: "price", width: "10%", align: "center" },
    { label: "Start Date", field: "startDateFormatted", width: "12%", align: "center" },
    { label: "End Date", field: "endDateFormatted", width: "12%", align: "center" },
    { label: "Payment Status", field: "paymentStatus", width: "10%", align: "center" },
  ];

  const sourceData = filtersActive ? filteredData : subscriptions;
  const totalPages = Math.max(1, Math.ceil(sourceData.length / pageSize));
  const pagedData = sourceData.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [filtersActive]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const contextMenuItems = [
    { label: "View Details", onClick: (row) => setSelectedSubscription(row) },
    { label: "Edit", onClick: handleEdit },
    { label: "Delete", onClick: handleDelete, danger: true },
  ];

  return (
    <div className="h-full overflow-hidden grid grid-rows-[auto_1fr] gap-4 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Subscriptions</h1>

        <div className="flex gap-2">
          <PrintListBtn
            label="Subscription"
            columns={columns}
            data={subscriptions}
            filtersActive={filtersActive}
            filteredData={filteredData}
            topSection={[
              { title: "Total Records", value: filtersActive ? filteredData.length : subscriptions.length },
            ]}
            firstPageRowCount={18}
            otherPageRowCount={19}
          />

          <Filters
            fields={[
              { name: "businessName", label: "Business", type: "text" },
              { name: "type", label: "Type", type: "select", options: [
                { value: "monthly", label: "Monthly" },
                { value: "yearly", label: "Yearly" }
              ]},
              { name: "paymentStatus", label: "Payment Status", type: "select", options: [
                { value: "paid", label: "Paid" },
                { value: "unpaid", label: "Unpaid" },
                { value: "pending", label: "Pending" },
              ]}
            ]}
            data={subscriptions}
            onFiltered={(rows, active) => {
              setFilteredData(rows);
              setFiltersActive(active);
            }}
          />
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={pagedData}
        onRowClick={(sub) => setSelectedSubscription(sub)}
        contextMenuItems={contextMenuItems}
        loading={loading}
        bottomButtonOnclick={() => {
          setEditingSubscription(null);
          setIsModalOpen(true);
        }}
        bottomButtonIcon={<Plus size={16} />}
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Modals */}
      <AnimatePresence>
        {isModalOpen && (
          <AddSubscriptionModal
            onClose={() => {
              setIsModalOpen(false);
              setEditingSubscription(null);
            }}
            onSave={handleAddOrUpdateSubscription}
            initialData={editingSubscription}
            businessOptions={businesses}
          />
        )}

        {selectedSubscription && (
          <SubscriptionDetailsModal
            subscription={selectedSubscription}
            onClose={() => setSelectedSubscription(null)}
            onEdit={handleEdit}
            onToggleStatus={handleToggleStatus}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
