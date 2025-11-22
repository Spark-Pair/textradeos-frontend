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

  const printInvoice = (divId) => {
    const element = document.getElementById(divId);
    if (!element) return;

    // Remove old iframe if exists
    let oldIframe = document.getElementById("pdfIframe");
    if (oldIframe) oldIframe.remove();

    // Create a hidden iframe
    const iframe = document.createElement("iframe");
    iframe.id = "pdfIframe";
    iframe.style.position = "absolute";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    iframe.style.display = "none";

    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();

    // Inject current page's styles
    const styles = Array.from(document.querySelectorAll("link[rel=stylesheet], style"))
      .map(node => node.outerHTML)
      .join("\n");

    doc.write(`
    <html>
      <head>
        <title>Invoice</title>
        ${styles}
        <style>
          @page { size: A5; margin: 0; }
          body { margin:0; padding:0; }
          #${divId} { width: 148mm; height: auto; }
        </style>
      </head>
      <body>
        ${element.outerHTML}
      </body>
    </html>
  `);

    doc.close();

    // Wait for iframe to render
    iframe.onload = () => {
      try {
        iframe.contentWindow.focus();
        // Use browser print with silent download
        iframe.contentWindow.print();
        setTimeout(() => iframe.remove(), 1000);
      } catch (err) {
        console.error("PDF download failed:", err);
      }
    };
  };

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
            id="actual-invoice"
            className="bg-white border border-gray-300 p-6 rounded-2xl text-xs flex flex-col roboto-font"
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
                <p className="mb-1"><span className="font-medium">Customer:</span> {invoice.customerId?.name || "-"}</p>
                <p><span className="font-medium">Contact:</span> {invoice.customerId?.phone_no || "-"}</p>
              </div>
              <div className="invoice-details">
                {/* date and invoice no */}
                <p className="mb-1"><span className="font-medium">Date:</span> {formatDateWithDay(invoice.createdAt)}</p>
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
          onClick={() => printInvoice("actual-invoice")}
          variant="green-btn"
        >
          Print
        </Button>
        <Button
          onClick={onClose}
          variant="secondary-btn"
        >
          Close
        </Button>
      </div>
    </Modal>
  );
}