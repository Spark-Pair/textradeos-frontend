import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Button from "../../components/Button";
import GenerateInvoiceModal from "../../components/Invoices/GenerateInvoiceModal";
import InvoiceDetailsModal from "../../components/Invoices/InvoiceDetailsModal";
import Table from "../../components/Table";
import axiosClient from "../../api/axiosClient";
import { formatDateWithDay } from "../../utils/index";
import { useToast } from "../../context/ToastContext";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Invoices() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Invoices | TexTradeOS";
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get("/invoices/");
      
      const flattened = data.map((invoice) => ({
        ...invoice,
        customerName: invoice.customerId?.name || "-",
        date: formatDateWithDay(invoice.createdAt),
      }));

      console.log(flattened);
      setInvoices(flattened);
      
    } catch (error) {
      console.error("Failed to load invoices:", error);
      addToast("Failed to load invoices", "error");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { label: "#", render: (_, i) => i + 1, width: "40px" },
    { label: "Date", field: "date", width: "16%" },
    { label: "Customer", field: "customerName", width: "auto" },
    { label: "Invoice No.", field: "invoiceNumber", width: "12%" },
    { label: "Gross Amount", field: "grossAmount", width: "15%", align: "center" },
    { label: "Discount", field: "discount", width: "15%", align: "center" },
    { label: "Net Amount", field: "netAmount", width: "15%", align: "center" },
  ];

  const contextMenuItems = [
    { label: "View Details", onClick: (invoice) => setSelectedInvoice(invoice) },
  ];

  return (
    <div className="w-full h-full overflow-hidden grid grid-rows-[auto_1fr] gap-4 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <Button>
          Filter
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={invoices}
        onRowClick={(invoice) => setSelectedInvoice(invoice)}
        contextMenuItems={contextMenuItems}
        loading={loading}
        bottomButtonOnclick={() => {
          navigate('/customers')
        }}
        bottomButtonIcon={<Users size={16} />}
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
          />
        )}
      </AnimatePresence>
    </div>
  );
}
