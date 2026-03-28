import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import AddBusinessModal from "../../components/Businesses/AddBusinessModal";
import BusinessDetailsModal from "../../components/Businesses/BusinessDetailsModal";
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

export default function Businesses() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [editingBusiness, setEditingBusiness] = useState(null);

  const [businesses, setBusinesses] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filtersActive, setFiltersActive] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    document.title = "Businesses | TexTradeOS";
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      const data = await loadCachedThenNetwork({
        store: "businesses",
        endpoint: "/businesses/",
        axiosClient,
        bizId: user?.businessId?._id || user?.businessId || null,
        onCache: (cached) => {
          const cachedFlattened = cached.map((biz) => ({
            ...biz,
            username: biz.userId?.username || "-",
            status: biz.isActive ? "Active" : "Inactive",
            reg_date: formatDateWithDay(biz.registration_date),
          }));
          setBusinesses(cachedFlattened);
          setLoading(false);
        },
      });

      const flattened = data.map((biz) => ({
        ...biz,
        username: biz.userId?.username || "-",
        status: biz.isActive ? "Active" : "Inactive",
        reg_date: formatDateWithDay(biz.registration_date),
      }));
      setBusinesses(flattened);

    } catch (error) {
      console.error("Failed to load businesses:", error);
      addToast("Failed to load businesses", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdateBusiness = async (formData) => {
    try {
      if (editingBusiness) {
        // 🟢 Update existing
        await updateItem({
          store: "businesses",
          endpoint: "/businesses",
          axiosClient,
          id: editingBusiness._id,
          payload: formData,
          bizId: user?.businessId?._id || user?.businessId || null,
        });
      } else {
        // 🟢 Create new
        await createItem({
          store: "businesses",
          endpoint: "/businesses",
          axiosClient,
          payload: formData,
          bizId: user?.businessId?._id || user?.businessId || null,
        });
      }
      await loadBusinesses();
      setIsModalOpen(false);
      setEditingBusiness(null);
    } catch (error) {
      console.error("Failed to save business:", error);
      addToast(error.response?.data?.message || "Failed to save business", "error");
    }
  };

  const handleDelete = async (biz) => {
    if (!window.confirm(`Delete ${biz.name}?`)) return;
    try {
      await deleteItem({
        store: "businesses",
        endpoint: "/businesses",
        axiosClient,
        id: biz._id,
      });
      await loadBusinesses();
    } catch (error) {
      console.error("Failed to delete business:", error);
      addToast("Failed to delete business", "error");
    }
  };

  const handleEdit = (biz) => {
    setEditingBusiness(biz);
    setIsModalOpen(true);
  };

  const columns = [
    { label: "#", render: (_, i) => i + 1, width: "3%" },
    { label: "Business Name", field: "name", width: "auto" },
    { label: "Owner", field: "owner", width: "12%" },
    { label: "Phone", field: "phone_no", width: "15%", align: "center" },
    { label: "Registration Date", field: "reg_date", width: "18%", align: "center" },
    { label: "Type", field: "type", width: "10%", align: "center", },
    { label: "Price", field: "price", width: "10%", align: "center", },
    { label: "Status", field: "status", width: "10%", align: "center" },
  ];

  const sourceData = filtersActive ? filteredData : businesses;
  const totalPages = Math.max(1, Math.ceil(sourceData.length / pageSize));
  const pagedData = sourceData.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [filtersActive]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const contextMenuItems = [
    { label: "View Details", onClick: (row) => console.log(row) },
    { label: "Edit", onClick: (row) => console.log("Edit:", row) },
    { label: "Delete", onClick: (row) => console.log("Delete:", row), danger: true },
  ];

  const handleToggleStatus = async (biz) => {
    setSelectedBusiness(null)
    try {
      await postAction({
        endpoint: `/businesses/${biz._id}/toggle`,
        axiosClient,
        payload: {},
        method: "patch",
        optimistic: async () => {
          const next = businesses.map((b) =>
            b._id === biz._id ? { ...b, isActive: !b.isActive } : b
          );
          setBusinesses(next);
          const db = await dbPromise;
          const item = await db.get("businesses", biz._id);
          if (item) {
            await db.put("businesses", { ...item, isActive: !item.isActive });
          }
        },
      });
      await loadBusinesses();
    } catch (error) {
      console.error("Failed change status:", error);
      addToast("Failed change status", "error");
    }
  };

  return (
    <div className="h-full overflow-hidden grid grid-rows-[auto_1fr] gap-4 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Businesses</h1>

        <div className="flex gap-2">
          <PrintListBtn
            label="Business"
            columns={columns}
            data={businesses}
            filtersActive={filtersActive}
            filteredData={filteredData}
            topSection={[
              { title: "Total Records", value: filtersActive ? filteredData.length : businesses.length },
              { title: "Balance", value: "2050" },
            ]}
            firstPageRowCount={18}
            otherPageRowCount={19}
          />

          <Filters
            fields={[
              { name: "name", label: "Business Name", type: "text", field: "name" },
              { name: "owner", label: "Owner", type: "text", field: "owner" },
              { name: "phone", label: "Phone No.", type: "text", field: "phone_no" },
              { name: "reg_date", label: "Reg. Date", type: "reg_date" },
              {
                name: "type",
                label: "Type",
                type: "select",
                field: "type",
                options: [
                  { value: "monthly", label: "Monthly" },
                  { value: "yearly", label: "Yearly" }
                ],
              },
              {
                name: "status",
                label: "Status",
                type: "select",
                field: "status",
                options: [
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" }
                ]
              },
            ]}
            data={businesses}
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
        onRowClick={(biz) => setSelectedBusiness(biz)}
        contextMenuItems={contextMenuItems}
        loading={loading}
        bottomButtonOnclick={() => {
          setEditingBusiness(null);
          setIsModalOpen(true);
        }}
        bottomButtonIcon={<Plus size={16} />}
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Modals */}
      <AnimatePresence>
        {isModalOpen && (
          <AddBusinessModal
            onClose={() => {
              setIsModalOpen(false);
              setEditingBusiness(null);
            }}
            onSave={handleAddOrUpdateBusiness}
            initialData={editingBusiness} // 👈 prefill data
          />
        )}

        {selectedBusiness && (
          <BusinessDetailsModal
            business={selectedBusiness}
            onClose={() => setSelectedBusiness(null)}
            onEdit={handleEdit}
            onToggleStatus={handleToggleStatus}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
