import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Button from "../../components/Button";
import GenerateInvoiceModal from "../../components/Invoices/GenerateInvoiceModal";
import InvoiceDetailsModal from "../../components/Invoices/InvoiceDetailsModal";
import Table from "../../components/Table";
import axiosClient from "../../api/axiosClient";
import { formatDateWithDay } from "../../utils/index";
import { useToast } from "../../context/ToastContext";

export default function Invoices() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    document.title = "Invoices | TexTradeOS";
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get("/invoices/");
      console.log(data);
      
      const flattened = data.map((invoice) => ({
        ...invoice,
        username: invoice.userId?.username || "-",
        status: invoice.isActive ? "Active" : "Inactive",
        reg_date: formatDateWithDay(invoice.registration_date),
      }));
      setInvoices(flattened);
      console.log(flattened);
      
    } catch (error) {
      console.error("Failed to load invoices:", error);
      addToast("Failed to load invoices", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdateInvoice = async (formData) => {
    try {
      if (editingInvoice) {
        // 🟢 Update existing
        await axiosClient.put(`/invoices/${editingInvoice._id}`, formData);
      } else {
        // 🟢 Create new
        await axiosClient.post("/invoices/", formData);
      }
      await loadInvoices();
      setIsModalOpen(false);
      setEditingInvoice(null);
    } catch (error) {
      console.error("Failed to save invoice:", error);
      addToast(error.response?.data?.message || "Failed to save invoice", "error");
    }
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setIsModalOpen(true);
  };

  const columns = [
    { label: "#", render: (_, i) => i + 1, width: "40px" },
    { label: "Invoice No.", field: "invoice_no", width: "12%" },
    { label: "Season", field: "season", width: "12%" },
    { label: "Size", field: "size", width: "15%", align: "center" },
    { label: "Category", field: "category", width: "18%", align: "center" },
    { label: "Type", field: "type", width: "10%", align: "center",},
    { label: "Purchase Price", field: "purchase_price", width: "10%", align: "center",},
    { label: "Selling Price", field: "selling_price", width: "10%", align: "center" },
    { label: "Stock", field: "stock", width: "auto", align: "center" },
  ];

  const contextMenuItems = [
    { label: "View Details", onClick: (invoice) => setSelectedInvoice(invoice) },
    { label: "Edit", onClick: handleEdit },
  ];

  return (
    <div className="w-full h-full overflow-hidden grid grid-rows-[auto_1fr] gap-4 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <Button
          onClick={() => {
            setEditingInvoice(null);
            setIsModalOpen(true);
          }}
        >
          Register Invoice
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={invoices}
        onRowClick={(invoice) => setSelectedInvoice(invoice)}
        contextMenuItems={contextMenuItems}
        loading={loading}
      />

      {/* Modals */}
      <AnimatePresence>
        {isModalOpen && (
          <GenerateInvoiceModal
            onClose={() => {
              setIsModalOpen(false);
              setEditingInvoice(null);
            }}
            onSave={handleAddOrUpdateInvoice}
            initialData={editingInvoice} // 👈 prefill data
          />
        )}

        {selectedInvoice && (
          <InvoiceDetailsModal
            invoice={selectedInvoice}
            onClose={() => setSelectedInvoice(null)}
            onEdit={handleEdit}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
