import Modal from "../Modal";
import Button from "../Button";
import { useAuth } from "../../context/AuthContext";
import { formatDateWithDay } from "../../utils";
import Table from "../Table";

export default function InvoiceDetailsModal({ invoice, onClose }) {
  if (!invoice) return null;

  const calculateItemTotal = (item) => {
    return (item.quantity * item.selling_price_snapshot).toFixed(2);
  };

  const a5Width = 420;
  const a5Height = 595;

  const { user } = useAuth();

  return (
    <Modal
      title={`Invoice Details - ${invoice.invoiceNumber}`}
      onClose={onClose}
      size="lg"
    >
      <div className="flex justify-center">
        <div
          className="bg-white shadow-md border border-gray-300 p-6 rounded-2xl"
          style={{
            width: `${a5Width}px`,
            height: `${a5Height}px`,
            overflowY: "auto",
          }}
        >
          <div className="flex justify-between items-center">
            <div className="business-name">{ user.name }</div>
            <div className="invoice-number">Sales Invoice</div>
          </div>

          <hr />

          <div className="flex justify-between items-center">
            <div className="customer-details">
              <p><strong>Customer:</strong> {invoice.customerId?.name || "-"}</p>
              <p><strong>Contact:</strong> {invoice.customerId?.phone_no || "-"}</p>
            </div>
            <div className="invoice-details">
              {/* date and invoice no */}
              <p><strong>Date:</strong> {formatDateWithDay(invoice.createdAt)}</p>
              <p><strong>Invoice No:</strong> {invoice.invoiceNumber}</p>
            </div>
          </div>

          <hr />

          <Table
            columns={[
              // s no, article_no, quantity, price
              { label: "#", render: (_, i) => i + 1, width: "40px" },
              { label: "Article No.", field: "article_no", width: "40px" },
              { label: "Quantity", field: "quantity", width: "100px", align: "center" },
              { label: "Price", field: "selling_price_snapshot", width: "100px", align: "center" },
              { label: "Total", render: (item) => calculateItemTotal(item), width: "100px", align: "center" },
            ]}
            data={invoice.items}
            bottomGap={false}
          />
        </div>
      </div>

      {/* Modal Actions */}
      <div className="mt-4 flex justify-end gap-2">
        <Button
          onClick={() => {
            onClose();
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Edit
        </Button>

        <Button onClick={onClose} className="bg-gray-300 hover:bg-gray-400">
          Close
        </Button>
      </div>
    </Modal>
  );
}