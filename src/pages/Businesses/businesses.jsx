import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Button from "../../components/Button";
import AddBusinessModal from "../../components/Businesses/AddBusinessModal";
import BusinessDetailsModal from "../../components/Businesses/BusinessDetailsModal";
import Table from "../../components/Table";
import axiosClient from "../../api/axiosClient";
import { formatDateWithDay } from "../../utils/index";
import { useToast } from "../../context/ToastContext";
import { Plus } from "lucide-react";

export default function Businesses() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [editingBusiness, setEditingBusiness] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    document.title = "Businesses | TexTradeOS";
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get("/businesses/");
      
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
        await axiosClient.put(`/businesses/${editingBusiness._id}`, formData);
      } else {
        // 🟢 Create new
        await axiosClient.post("/businesses/", formData);
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
      await axiosClient.delete(`/businesses/${biz._id}`);
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
    { label: "#", render: (_, i) => i + 1, width: "40px" },
    { label: "Business Name", field: "name", width: "auto" },
    { label: "Owner", field: "owner", width: "12%" },
    { label: "Phone", field: "phone_no", width: "15%", align: "center" },
    { label: "Registration Date", field: "reg_date", width: "18%", align: "center" },
    { label: "Type", field: "type", width: "10%", align: "center",},
    { label: "Price", field: "price", width: "10%", align: "center",},
    { label: "Status", field: "status", width: "10%", align: "center" },
  ];

  const contextMenuItems = [
    { label: "View Details", onClick: (row) => console.log(row) },
    { label: "Edit", onClick: (row) => console.log("Edit:", row) },
    { label: "Delete", onClick: (row) => console.log("Delete:", row), danger: true },
  ];

  const handleToggleStatus = async (biz) => {
    setSelectedBusiness(null)
    try {
      await axiosClient.patch(`/businesses/${biz._id}/toggle`);
      await loadBusinesses();
    } catch (error) {
      console.error("Failed change status:", error);
      addToast("Failed change status", "error");
    }
  };

  return (
    <div className="w-full h-full overflow-hidden grid grid-rows-[auto_1fr] gap-4 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Businesses</h1>
        <Button>
          Filter
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={businesses}
        onRowClick={(biz) => setSelectedBusiness(biz)}
        contextMenuItems={contextMenuItems}
        loading={loading}
        bottomButtonOnclick={() => {
            setEditingBusiness(null);
            setIsModalOpen(true);
          }}
        bottomButtonIcon={<Plus size={16} />}
      />

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
