import Modal from "../Modal";
import Button from "../Button";

export default function InvoiceDetailsModal({ invoice, onClose, onEdit, onToggleStatus }) {
  if (!invoice) return null;

  const isActive = invoice.status === "Active";

  return (
    <Modal title={invoice.name} onClose={onClose} size="md">
      <div className="space-y-2 text-gray-700">
        <p><strong>Invoice No.:</strong> {invoice.invoice_no}</p>
        <p><strong>Season:</strong> {invoice.season}</p>
        <p><strong>Size:</strong> {invoice.size}</p>
        <p><strong>Category:</strong> {invoice.category}</p>
        <p><strong>Type:</strong> {invoice.type}</p>
        <p><strong>Purchase Price:</strong> {invoice.purchase_price}</p>
        <p><strong>Selling Price:</strong> {invoice.selling_price}</p>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button
          onClick={() => {
            onClose();
            onEdit(invoice);
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
