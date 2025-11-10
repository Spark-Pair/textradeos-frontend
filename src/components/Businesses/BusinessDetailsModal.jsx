import Modal from "../Modal";
import Button from "../Button";

export default function BusinessDetailsModal({ business, onClose, onEdit }) {
  if (!business) return null;

  return (
    <Modal title={business.name} onClose={onClose} size="md">
      <div className="space-y-2 text-gray-700">
        <p><strong>Owner:</strong> {business.owner}</p>
        <p><strong>Username:</strong> {business.username}</p>
        <p><strong>Phone:</strong> {business.phone_no}</p>
        <p><strong>Registration Date:</strong> {new Date(business.registration_date).toLocaleDateString()}</p>
        <p><strong>Type:</strong> {business.type}</p>
        <p><strong>Price:</strong> {business.price}</p>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button
          onClick={() => {
            onClose();
            onEdit(business);
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
