import Modal from "../Modal";
import Button from "../Button";

export default function CustomerDetailsModal({ customer, onClose, onEdit, onToggleStatus }) {
  if (!customer) return null;

  const isActive = customer.status === "Active";

  return (
    <Modal title={customer.name} onClose={onClose} size="md">
      <div className="space-y-2 text-gray-700">
        <p><strong>Owner:</strong> {customer.owner}</p>
        <p><strong>Username:</strong> {customer.username}</p>
        <p><strong>Phone:</strong> {customer.phone_no}</p>
        <p>
          <strong>Registration Date:</strong>{" "}
          {customer.registration_date
            ? new Date(customer.registration_date).toLocaleDateString()
            : "-"}
        </p>
        <p><strong>Type:</strong> {customer.type}</p>
        <p><strong>Price:</strong> {customer.price}</p>
        <p>
          <strong>Status:</strong>{" "}
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {isActive ? "Active" : "In Active"}
          </span>
        </p>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button
          onClick={() => onToggleStatus && onToggleStatus(customer)}
          className={`${
            isActive
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          {isActive ? "In Active" : "Activate"}
        </Button>

        <Button
          onClick={() => {
            onClose();
            onEdit(customer);
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
