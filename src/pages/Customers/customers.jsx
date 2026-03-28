import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import AddCustomerModal from "../../components/Customers/AddCustomerModal";
import AddPaymentModal from "../../components/Customers/AddPaymentModal";
import CustomerDetailsModal from "../../components/Customers/CustomerDetailsModal";
import Table from "../../components/Table";
import axiosClient from "../../api/axiosClient";
import { loadCachedThenNetwork, createItem, updateItem, postAction, getStatementCache, setStatementCache } from "../../offline/api";
import { useToast } from "../../context/ToastContext";
import { extractMongooseMessage } from "../../utils/index";
import { Plus } from "lucide-react";
import Filters from "../../components/Filters";
import GenerateStatementModal from "../../components/Customers/GenerateStatementModal";
import StatementModal from "../../components/Customers/StatementModal";
import PrintListBtn from "../../components/PrintListBtn";
import { dbPromise } from "../../offline/db";
import Pagination from "../../components/Pagination";
import { useAuth } from "../../context/AuthContext";

export default function Customers() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [isGenerateStatementModalOpen, setIsGenerateStatementModalOpen] = useState(false);
  const [statementCustomer, setStatementCustomer] = useState(null);

  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
  const [statementData, setStatementData] = useState(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentCustomer, setPaymentCustomer] = useState(null);

  const [customers, setCustomers] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filtersActive, setFiltersActive] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [loading, setLoading] = useState(false);

  const { addToast } = useToast();

  useEffect(() => {
    document.title = "Customers | TexTradeOS";
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await loadCachedThenNetwork({
        store: "customers",
        endpoint: "/customers/",
        axiosClient,
        bizId: user?.businessId?._id || user?.businessId || null,
        onCache: (cached) => {
          const cachedFlattened = cached.map((customer) => ({
            ...customer,
            status: customer.isActive ? "Active" : "In Active",
            address: customer.address || "-",
          }));
          setCustomers(cachedFlattened);
          setLoading(false);
        },
      });

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
        await updateItem({
          store: "customers",
          endpoint: "/customers",
          axiosClient,
          id: editingCustomer._id,
          payload: formData,
          bizId: user?.businessId?._id || user?.businessId || null,
        });
      } else {
        // 🟢 Create new
        await createItem({
          store: "customers",
          endpoint: "/customers",
          axiosClient,
          payload: formData,
          bizId: user?.businessId?._id || user?.businessId || null,
        });
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
      const data = await createItem({
        store: "payments",
        endpoint: "/payments",
        axiosClient,
        payload: formData,
        bizId: user?.businessId?._id || user?.businessId || null,
        responseSelector: (res) => res.data || res,
      });
      await loadCustomers();
      setIsModalOpen(false);
      setEditingCustomer(null);
      addToast(data.message || "Payment added", "success");
    } catch (error) {
      console.error("Failed to save customer:", error);

      addToast(extractMongooseMessage(error.response?.data?.message) || "Failed to save customer", "error");
    }
  };

  const handleGenerateStatement = async (formData) => {
    try {
      const { customerId, ...dataToSend } = formData;
      const cacheKey = `statement:${customerId}:${dataToSend.date_from || "-"}:${dataToSend.date_to || "-"}`;
      const cached = await getStatementCache(cacheKey);
      if (cached) {
        setStatementData(cached);
        setIsStatementModalOpen(true);
      }

      const { data } = await axiosClient.patch(`/customers/${customerId}/statement`, dataToSend);

      setIsGenerateStatementModalOpen(false);
      setStatementCustomer(null);

      setStatementData(data);
      setIsStatementModalOpen(true);
      await setStatementCache(cacheKey, data);

      addToast("Statement generated successfully", "success");
    } catch (error) {
      console.error("Failed to generate statement:", error);
      if (!navigator.onLine) {
        addToast("Offline: showing cached statement if available", "error");
        return;
      }
      addToast(
        error.response?.data?.message || "Failed to generate statement",
        "error"
      );
      return null;
    }
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
    { label: "#", render: (_, i) => i + 1, width: "3%" },
    { label: "Customer Name", field: "name", width: "auto", className: "capitalize" },
    { label: "Person Name", field: "person_name", width: "12%", className: "capitalize" },
    { label: "Phone", field: "phone_no", width: "15%", align: "center" },
    { label: "Address", field: "address", width: "18%", align: "center" },
    { label: "Balance", field: "balance", width: "18%", align: "center" },
    { label: "Status", field: "status", width: "10%", align: "center" },
  ];

  const sourceData = filtersActive ? filteredData : customers;
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

  const handleToggleStatus = async (customer) => {
    setSelectedCustomer(null)
    try {
      await postAction({
        endpoint: `/customers/${customer._id}/toggle`,
        axiosClient,
        payload: {},
        method: "patch",
        optimistic: async () => {
          const next = customers.map((c) =>
            c._id === customer._id ? { ...c, isActive: !c.isActive } : c
          );
          setCustomers(next);
          const db = await dbPromise;
          const item = await db.get("customers", customer._id);
          if (item) {
            await db.put("customers", { ...item, isActive: !item.isActive });
          }
        },
      });
      await loadCustomers();
    } catch (error) {
      console.error("Failed change status:", error);
      addToast("Failed change status", "error");
    }
  };

  return (
    <div className="h-full overflow-hidden grid grid-rows-[auto_1fr] gap-4 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Customers</h1>

        <div className="flex gap-2">
          <PrintListBtn
            label="Customer"
            columns={columns}
            data={customers}
            filtersActive={filtersActive}
            filteredData={filteredData}
            topSection={[
              { title: "Total Records", value: filtersActive ? filteredData.length : customers.length },
              { title: "Balance", value: "2050" },
            ]}
            firstPageRowCount={18}
            otherPageRowCount={19}
          />

          <Filters
            fields={[
              { name: "customerName", label: "Customer Name", type: "text", field: "name" },
              { name: "personName", label: "Person Name", type: "text", field: "person_name" },
              { name: "phone", label: "Phone No.", type: "text", field: "phone_no" },
              { name: "address", label: "Address", type: "text", field: "address" },
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
            data={customers}
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
        onRowClick={(customer) => setSelectedCustomer(customer)}
        contextMenuItems={contextMenuItems}
        loading={loading}
        bottomButtonOnclick={() => {
          setEditingCustomer(null);
          setIsModalOpen(true);
        }}
        bottomButtonIcon={<Plus size={16} />}
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

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

        {isStatementModalOpen && (
          <StatementModal
            onClose={() => {
              setIsStatementModalOpen(false);
              setStatementData(null);
            }}
            statementData={statementData} // 👈 prefill data
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
