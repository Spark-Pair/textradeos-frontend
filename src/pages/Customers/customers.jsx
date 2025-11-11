import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Button from "../../components/Button";
import AddCustomerModal from "../../components/Customers/AddCustomerModal";
import CustomerDetailsModal from "../../components/Customers/CustomerDetailsModal";
import Table from "../../components/Table";
import axiosClient from "../../api/axiosClient";
import { formatDateWithDay } from "../../utils/dateFormatter";

export default function Customers() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Customers | TexTradeOS";
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get("/customers/");
      
      const flattened = data.map((biz) => ({
        ...biz,
        status: biz.isActive ? "Active" : "Inactive",
      }));
      setCustomers(flattened);
    } catch (error) {
      console.error("Failed to load customers:", error);
      alert("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdateCustomer = async (formData) => {
    try {
      if (editingCustomer) {
        // 🟢 Update existing
        await axiosClient.put(`/customers/${editingCustomer._id}`, formData);
      } else {
        // 🟢 Create new
        await axiosClient.post("/customers/", formData);
      }
      await loadCustomers();
      setIsModalOpen(false);
      setEditingCustomer(null);
    } catch (error) {
      console.error("Failed to save customer:", error);
      alert(error.response?.data?.message || "Failed to save customer");
    }
  };

  const handleDelete = async (biz) => {
    if (!window.confirm(`Delete ${biz.name}?`)) return;
    try {
      await axiosClient.delete(`/customers/${biz._id}`);
      await loadCustomers();
    } catch (error) {
      console.error("Failed to delete customer:", error);
      alert("Failed to delete customer");
    }
  };

  const handleEdit = (biz) => {
    setEditingCustomer(biz);
    setIsModalOpen(true);
  };

  const columns = [
    { label: "#", render: (_, i) => i + 1, width: "40px" },
    { label: "Customer Name", field: "name", width: "auto" },
    { label: "Person Name", field: "person_name", width: "12%" },
    { label: "Phone", field: "phone_no", width: "15%", align: "center" },
    { label: "Address", field: "address", width: "18%", align: "center" },
    { label: "Status", field: "status", width: "10%", align: "center" },
  ];

  const contextMenuItems = [
    { label: "View Details", onClick: (row) => console.log(row) },
    { label: "Edit", onClick: (row) => console.log("Edit:", row) },
    { label: "Delete", onClick: (row) => console.log("Delete:", row), danger: true },
  ];

  const handleToggleStatus = async (biz) => {
    setSelectedCustomer(null)
    try {
      await axiosClient.patch(`/customers/${biz._id}/toggle`);
      await loadCustomers();
    } catch (error) {
      console.error("Failed change status:", error);
      alert("Failed change status");
    }
  };

  return (
    <div className="w-full h-full overflow-hidden grid grid-rows-[auto_1fr] gap-4 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Customers</h1>
        <Button
          onClick={() => {
            setEditingCustomer(null);
            setIsModalOpen(true);
          }}
        >
          Register Customer
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={customers}
        onRowClick={(biz) => setSelectedCustomer(biz)}
        contextMenuItems={contextMenuItems}
        loading={loading}
      />

      {/* Modals */}
      <AnimatePresence>
        {isModalOpen && (
          <AddCustomerModal
            onClose={() => {
              setIsModalOpen(false);
              setEditingCustomer(null);
            }}
            onSave={handleAddOrUpdateCustomer}
            initialData={editingCustomer} // 👈 prefill data
          />
        )}

        {selectedCustomer && (
          <CustomerDetailsModal
            customer={selectedCustomer}
            onClose={() => setSelectedCustomer(null)}
            onEdit={handleEdit}
            onToggleStatus={handleToggleStatus}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
