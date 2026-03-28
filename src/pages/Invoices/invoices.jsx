import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import GenerateInvoiceModal from "../../components/Invoices/GenerateInvoiceModal";
import InvoiceDetailsModal from "../../components/Invoices/InvoiceDetailsModal";
import Table from "../../components/Table";
import axiosClient from "../../api/axiosClient";
import { loadCachedThenNetwork, createItem, updateItem } from "../../offline/api";
import { formatDateWithDay } from "../../utils/index";
import { useToast } from "../../context/ToastContext";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Filters from "../../components/Filters";
import PrintListBtn from "../../components/PrintListBtn";
import Pagination from "../../components/Pagination";
import { useAuth } from "../../context/AuthContext";

export default function Invoices() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);

  const [invoices, setInvoices] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filtersActive, setFiltersActive] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;

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
      const data = await loadCachedThenNetwork({
        store: "invoices",
        endpoint: "/invoices/",
        axiosClient,
        bizId: user?.businessId?._id || user?.businessId || null,
        onCache: (cached) => {
          const cachedFlattened = cached.map((invoice) => ({
            ...invoice,
            customerName: invoice.customerId?.name || "Walk-in Customer",
            date: formatDateWithDay(invoice.invoiceDate || invoice.createdAt),
          }));
          setInvoices(cachedFlattened);
          setLoading(false);
        },
      });
      const flattened = data.map((invoice) => ({
        ...invoice,
        // Update: Agar customerId null hai toh "Walk-in Customer" dikhao
        customerName: invoice.customerId?.name || "Walk-in Customer",
        date: formatDateWithDay(invoice.invoiceDate || invoice.createdAt),
      }));
      setInvoices(flattened);
    } catch (error) {
      addToast("Failed to load invoices", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdateInvoice = async (formData) => {
    try {
      if (editingInvoice) {
        await updateItem({
          store: "invoices",
          endpoint: "/invoices",
          axiosClient,
          id: editingInvoice._id,
          payload: formData,
          bizId: user?.businessId?._id || user?.businessId || null,
        });
        addToast("Invoice updated successfully", "success");
      } else {
        await createItem({
          store: "invoices",
          endpoint: "/invoices",
          axiosClient,
          payload: formData,
          bizId: user?.businessId?._id || user?.businessId || null,
        });
        addToast("Invoice created successfully", "success");
      }
      await loadInvoices();
      setIsModalOpen(false);
      setEditingInvoice(null);
    } catch (error) {
      console.error("Failed to save invoice:", error);
      // backend error message extraction
      addToast(error.response?.data?.message || "Failed to save invoice", "error");
    }
  };

  const columns = [
    { label: "#", render: (_, i) => i + 1, width: "3%" },
    { label: "Date", field: "date", width: "16%" },
    { label: "Customer", field: "customerName", width: "auto" },
    { label: "Invoice No.", field: "invoiceNumber", width: "12%" },
    { label: "Gross Amount", field: "grossAmount", width: "15%", align: "center" },
    { label: "Discount", field: "discount", width: "15%", align: "center" },
    { label: "Net Amount", field: "netAmount", width: "15%", align: "center" },
  ];

  const sourceData = filtersActive ? filteredData : invoices;
  const totalPages = Math.max(1, Math.ceil(sourceData.length / pageSize));
  const pagedData = sourceData.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [filtersActive]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const contextMenuItems = [
    { label: "View Details", onClick: (invoice) => setSelectedInvoice(invoice) },
  ];

  return (
    <div className="h-full overflow-hidden grid grid-rows-[auto_1fr] gap-4 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Invoices</h1>

        <div className="flex gap-2">
          <PrintListBtn
            label="Invoice"
            columns={columns}
            data={invoices}
            filtersActive={filtersActive}
            filteredData={filteredData}
            topSection={[
              { title: "Total Records", value: filtersActive ? filteredData.length : invoices.length },
              { title: "Balance", value: "2050" },
            ]}
            firstPageRowCount={18}
            otherPageRowCount={19}
          />

          <Filters
            fields={[
              {
                name: "invoiceNumber",
                label: "Invoice No.",
                type: "text",
                field: "invoiceNumber",
              },
              {
                name: "customerName",
                label: "Customer Name",
                type: "text",
                field: "customerName",
              },
              {
                name: "date",
                label: "Date",
                type: "date",
                field: "date",
              },
            ]}
            data={invoices}
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
        onRowClick={(invoice) => setSelectedInvoice(invoice)}
        contextMenuItems={contextMenuItems}
        loading={loading}
        bottomButtonOnclick={() => {
          setEditingInvoice(null);
          setIsModalOpen(true);
        }}
        bottomButtonIcon={<Plus size={16} />}
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

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
