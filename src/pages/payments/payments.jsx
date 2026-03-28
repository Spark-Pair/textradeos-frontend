import { useEffect, useState } from "react";
import Table from "../../components/Table";
import axiosClient from "../../api/axiosClient";
import { loadCachedThenNetwork } from "../../offline/api";
import { formatDateWithDay } from "../../utils/index";
import { useToast } from "../../context/ToastContext";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PaymentDetailsModal from "../../components/Payments/PaymentDetailsModal";
import { AnimatePresence } from "framer-motion";
import Filters from "../../components/Filters";
import PrintListBtn from "../../components/PrintListBtn";
import Pagination from "../../components/Pagination";
import { useAuth } from "../../context/AuthContext";

export default function Payments() {
  const { user } = useAuth();
  const [selectedPayment, setSelectedPayment] = useState(null);

  const [payments, setPayments] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filtersActive, setFiltersActive] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Payments | TexTradeOS";
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await loadCachedThenNetwork({
        store: "payments",
        endpoint: "/payments/",
        axiosClient,
        bizId: user?.businessId?._id || user?.businessId || null,
        onCache: (cached) => {
          const cachedFlattened = cached.map((payment) => ({
            ...payment,
            name: payment.customerId?.name,
            entry_date: formatDateWithDay(payment.date),
            payment_date: payment.cheque_date ? formatDateWithDay(payment.cheque_date) : payment.slip_date ? formatDateWithDay(payment.slip_date) : "-",
            clear_date: payment.clear_date ? formatDateWithDay(payment.clear_date) : "-",
            reff_no: payment.cheque_no !== "" ? payment.cheque_no : payment.slip_no !== "" ? payment.slip_no : payment.transaction_id !== "" ? payment.transaction_id : "-",
          }));
          setPayments(cachedFlattened);
          setLoading(false);
        },
      });

      const flattened = data.map((payment) => ({
        ...payment,
        name: payment.customerId?.name || "-",
        entry_date: formatDateWithDay(payment.date),
        payment_date: payment.cheque_date ? formatDateWithDay(payment.cheque_date) : payment.slip_date ? formatDateWithDay(payment.slip_date) : "-",
        clear_date: payment.clear_date ? formatDateWithDay(payment.clear_date) : "-",
        reff_no: payment.cheque_no !== "" ? payment.cheque_no : payment.slip_no !== "" ? payment.slip_no : payment.transaction_id !== "" ? payment.transaction_id : "-",
      }));
      setPayments(flattened);

    } catch (error) {
      console.error("Failed to load payments:", error);
      addToast("Failed to load payments", "error");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { label: "#", render: (_, i) => i + 1, width: "3%" },
    { label: "Customer", field: "name", width: "auto", className: "capitalize" },
    { label: "Method", field: "method", width: "10%", className: "capitalize" },
    { label: "Date", field: "entry_date", width: "15%", align: "center" },
    { label: "Reff No.", field: "reff_no", width: "18%", align: "center" },
    { label: "Payment Date", field: "payment_date", width: "15%", align: "center", },
    { label: "Amount", field: "amount", width: "10%", align: "center", },
  ];

  const sourceData = filtersActive ? filteredData : payments;
  const totalPages = Math.max(1, Math.ceil(sourceData.length / pageSize));
  const pagedData = sourceData.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [filtersActive]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const contextMenuItems = [
    { label: "View Details", onClick: (payment) => setSelectedPayment(payment) },
  ];

  return (
    <div className="h-full overflow-hidden grid grid-rows-[auto_1fr] gap-4 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Payments</h1>

        <div className="flex gap-2">
          <PrintListBtn
            label="Payment"
            columns={columns}
            data={payments}
            filtersActive={filtersActive}
            filteredData={filteredData}
            topSection={[
              { title: "Total Records", value: filtersActive ? filteredData.length : payments.length },
              { title: "Balance", value: "2050" },
            ]}
            firstPageRowCount={18}
            otherPageRowCount={19}
          />

          <Filters
            fields={[
              { name: "customer", label: "Customer", type: "text", field: "name" },
              {
                name: "method",
                label: "Method",
                type: "select",
                field: "method",
                options: [
                  { value: "cash", label: "Cash" },
                  { value: "online", label: "Online" },
                  { value: "slip", label: "Slip" },
                  { value: "cheque", label: "Cheque" },
                ],
              },
              { name: "date", label: "Date", type: "date", field: "entry_date" },
              { name: "reff_no", label: "Reff No.", type: "text", field: "reff_no" },
              { name: "payment_date", label: "Payment Date", type: "date", field: "payment_date" },
            ]}
            data={payments}
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
        onRowClick={(payment) => setSelectedPayment(payment)}
        contextMenuItems={contextMenuItems}
        loading={loading}
        bottomButtonOnclick={() => {
          navigate('/customers')
        }}
        bottomButtonIcon={<Users size={16} />}
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Modals */}
      <AnimatePresence>
        {selectedPayment && (
          <PaymentDetailsModal
            payment={selectedPayment}
            onClose={() => setSelectedPayment(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
