import Modal from "../Modal";
import Button from "../Button";
import { useAuth } from "../../context/AuthContext";
import { formatDateWithDay } from "../../utils";
import Table from "../Table";

export default function InvoiceDetailsModal({ invoice, onClose }) {
  if (!invoice) return null;

  const calculateItemTotal = (item) => {
    return (item.quantity * item.selling_price_snapshot);
  };

  const a5Width = 148;
  const a5Height = 210;

  const { user } = useAuth();

  const flattenedItems = invoice.items.map((item) => ({
    ...item,
    article_no: item.articleId?.article_no || "-",
  }));

  return (
    <Modal
      title={`Invoice Details - ${invoice.invoiceNumber}`}
      onClose={onClose}
      size="2xl"
      className="2xl"
    >
      <div className="flex justify-center">
        <div className="h-[60vh] overflow-y-auto">
          <div
            className="bg-white shadow-md border border-gray-300 p-6 rounded-2xl text-xs flex flex-col"
            style={{
              width: `${a5Width}mm`,
              height: `${a5Height}mm`,
              overflowY: "auto",
            }}
          >
            <div className="flex justify-between items-center capitalize text-lg font-medium tracking-wide">
              <div className="business-name">{user.name}</div>
              <div className="invoice-number">Sales Invoice</div>
            </div>

            <hr className="border-gray-600 my-2" />

            <div className="flex justify-between items-center capitalize">
              <div className="customer-details">
                <p><span className="font-medium">Customer:</span> {invoice.customerId?.name || "-"}</p>
                <p><span className="font-medium">Contact:</span> {invoice.customerId?.phone_no || "-"}</p>
              </div>
              <div className="invoice-details">
                {/* date and invoice no */}
                <p><span className="font-medium">Date:</span> {formatDateWithDay(invoice.createdAt)}</p>
                <p><span className="font-medium">Invoice No:</span> {invoice.invoiceNumber}</p>
              </div>
            </div>

            <hr className="border-gray-600 my-2" />

            <div className="grow">
              <Table
                columns={[
                  // s no, article_no, quantity, price
                  { label: "#", render: (_, i) => i + 1, width: "40px", align: "left" },
                  { label: "Article No.", field: "article_no", width: "auto" },
                  { label: "Quantity", field: "quantity", width: "100px", align: "center" },
                  { label: "Price", field: "selling_price_snapshot", width: "100px", align: "center" },
                  { label: "Total", render: (item) => calculateItemTotal(item).toFixed(1), width: "100px", align: "center" },
                ]}
                data={flattenedItems}
                size="xs"
                bottomGap={false}
              />
            </div>

            <hr className="border-gray-600 my-2" />

            <div className="flex gap-2">
              <div className="flex-1 border border-gray-600 rounded-lg py-1.5 px-3 flex justify-between">
                <span>G. Amount:</span>
                {invoice.grossAmount.toFixed(1)}
              </div>
              <div className="flex-1 border border-gray-600 rounded-lg py-1.5 px-3 flex justify-between">
                <span>Discount:</span>
                {invoice.discount}%
              </div>
              <div className="flex-1 border border-gray-600 rounded-lg py-1.5 px-3 flex justify-between">
                <span>N. Amount:</span>
                {invoice.netAmount.toFixed(1)}
              </div>
            </div>

            <hr className="border-gray-600 my-2" />

            <div className="flex justify-between">
              <p>Powered by SparkPair</p>
              <p>© 2025 SparkPair | +92 316 5825495</p>
            </div>
          </div>
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