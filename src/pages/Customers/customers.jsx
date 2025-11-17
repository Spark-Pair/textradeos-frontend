import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Button from "../../components/Button";
import AddCustomerModal from "../../components/Customers/AddCustomerModal";
import AddPaymentModal from "../../components/Customers/AddPaymentModal";
import CustomerDetailsModal from "../../components/Customers/CustomerDetailsModal";
import Table from "../../components/Table";
import axiosClient from "../../api/axiosClient";
import { useToast } from "../../context/ToastContext";
import GenerateInvoiceModal from "../../components/Customers/GenerateInvoiceModal";
import { extractMongooseMessage } from "../../utils/index";
import InvoiceDetailsModal from "../../components/Invoices/InvoiceDetailsModal";
import { Plus } from "lucide-react";
import GenerateStatementModal from "../../components/Customers/GenerateStatementModal";

export default function Customers() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoicingCustomer, setInvoicingCustomer] = useState(null);

  const [isGenerateStatementModalOpen, setIsGenerateStatementModalOpen] = useState(false);
  const [statementCustomer, setStatementCustomer] = useState(null);

  const [isInvoiceDetailsModalOpen, setIsInvoiceDetailsModalOpen] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentCustomer, setPaymentCustomer] = useState(null);

  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(false);

  const { addToast } = useToast();

  useEffect(() => {
    document.title = "Customers | TexTradeOS";
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get("/customers/");
      
      const flattened = data.map((customer) => ({
        ...customer,
        status: customer.isActive ? "Active" : "In Active",
        address: customer.address || "-",
      }));
      setCustomers(flattened);
    } catch (error) {
      console.error("Failed to load customers:", error);
      addToast("Failed to load customers", "error");
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

      addToast(extractMongooseMessage(error.response?.data?.message) || "Failed to save customer", "error");
    }
  };

  const handleAddCustomerPayment = async (formData) => {
    try {
      const { data } = await axiosClient.post("/payments/", formData);
      await loadCustomers();
      setIsModalOpen(false);
      setEditingCustomer(null);
      addToast(data.message, "success");
    } catch (error) {
      console.error("Failed to save customer:", error);

      addToast(extractMongooseMessage(error.response?.data?.message) || "Failed to save customer", "error");
    }
  };

  const handleGenerateStatement = async (formData) => {
    try {
      const { data } = await axiosClient.post("/payments/", formData);
      await loadCustomers();
      setIsModalOpen(false);
      setEditingCustomer(null);
      addToast(data.message, "success");
    } catch (error) {
      console.error("Failed to save customer:", error);

      addToast(extractMongooseMessage(error.response?.data?.message) || "Failed to save customer", "error");
    }
  };

  const handleInvoice = (customer) => {
    setIsInvoiceModalOpen(true);
    setInvoicingCustomer(customer);
    console.log(customer);
    
  };

  const handlePayment = (customer) => {
    setIsPaymentModalOpen(true);
    setPaymentCustomer(customer);
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleStatement = (customer) => {
    setStatementCustomer(customer);
    setIsGenerateStatementModalOpen(true);
  };

  const columns = [
    { label: "#", render: (_, i) => i + 1, width: "40px" },
    { label: "Customer Name", field: "name", width: "auto", className: "capitalize" },
    { label: "Person Name", field: "person_name", width: "12%", className: "capitalize" },
    { label: "Phone", field: "phone_no", width: "15%", align: "center" },
    { label: "Address", field: "address", width: "18%", align: "center" },
    { label: "Balance", field: "balance", width: "18%", align: "center" },
    { label: "Status", field: "status", width: "10%", align: "center" },
  ];

  const contextMenuItems = [
    { label: "View Details", onClick: (row) => console.log(row) },
    { label: "Edit", onClick: (row) => console.log("Edit:", row) },
    { label: "Delete", onClick: (row) => console.log("Delete:", row), danger: true },
  ];

  const handleToggleStatus = async (customer) => {
    setSelectedCustomer(null)
    try {
      await axiosClient.patch(`/customers/${customer._id}/toggle`);
      await loadCustomers();
    } catch (error) {
      console.error("Failed change status:", error);
      addToast("Failed change status", "error");
    }
  };

  return (
    <div className="w-full h-full overflow-hidden grid grid-rows-[auto_1fr] gap-4 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Customers</h1>
        <Button>
          Filter
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={customers}
        onRowClick={(customer) => setSelectedCustomer(customer)}
        contextMenuItems={contextMenuItems}
        loading={loading}
        bottomButtonOnclick={() => {
            setEditingCustomer(null);
            setIsModalOpen(true);
          }}
        bottomButtonIcon={<Plus size={16} />}
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
        
        {isGenerateStatementModalOpen && (
          <GenerateStatementModal
            onClose={() => {
              setIsGenerateStatementModalOpen(false);
              setStatementCustomer(null);
            }}
            onSave={handleGenerateStatement}
            statementCustomer={statementCustomer} // 👈 prefill data
          />
        )}

        {isInvoiceModalOpen && (
          <GenerateInvoiceModal
            onClose={(invoice) => {
              setIsInvoiceModalOpen(false);
              setInvoicingCustomer(null);

              if (invoice && invoice._id) {
                setIsInvoiceDetailsModalOpen(true);
                setGeneratedInvoice(invoice);
              }
            }}
            invoicingCustomer={invoicingCustomer}
          />
        )}

        {isInvoiceDetailsModalOpen && (
          <InvoiceDetailsModal
            invoice={generatedInvoice}
            onClose={() => setGeneratedInvoice(null)}
          />
        )}

        {isPaymentModalOpen && (
          <AddPaymentModal
            onClose={() => {
              setIsPaymentModalOpen(false);
              setPaymentCustomer(null);
            }}
            onSave={handleAddCustomerPayment}
            selectedCustomer={paymentCustomer} // 👈 prefill data
          />
        )}

        {selectedCustomer && (
          <CustomerDetailsModal
            customer={selectedCustomer}
            onClose={() => setSelectedCustomer(null)}
            onInvoice={handleInvoice}
            onPayment={handlePayment}
            onEdit={handleEdit}
            onStatement={handleStatement}
            onToggleStatus={handleToggleStatus}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
