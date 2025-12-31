import Modal from "../Modal";
import Button from "../Button";
import DetailItem from "../DetailItem";
import { useAuth } from "../../context/AuthContext";

export default function CustomerDetailsModal({ customer, onClose, onPayment, onEdit, onStatement, onToggleStatus }) {
  const { user } = useAuth();
  if (!customer) return null;

  const isActive = customer.status === "Active";

  return (
    <Modal title={`Customer Details - ${customer.name}`} onClose={onClose} size="xl">
      <hr className="border-gray-300 mt-2 mb-4.5" />

      {/* --- Details Grid --- */}
      <div className="grid grid-cols-1 gap-x-8 gap-y-4 px-3">
        {/* Group 1: Core Product Info */}
        <div className="sm:col-span-1">
          <h4 className="text-base font-semibold text-gray-800 mb-2 border-b-2 border-[#127475] inline-block">General Info</h4>
          <div className="space-y-1">
            <DetailItem label="Person Name" value={customer.person_name} />
            <DetailItem label="Phone No." value={customer.phone_no} />
            <DetailItem label="Address" value={customer.address || "-"} />
            <DetailItem label="Balance" value={customer.balance} />
            <DetailItem label="Status" value={customer.status} chip={isActive ? 'green' : 'red'} />
          </div>
        </div>
      </div>

      {/* --- Actions --- */}
      <div className="mt-8 flex justify-end gap-3">
        <Button
          onClick={() => {
            onClose();
            onStatement(customer);
          }}
          variant="green-btn"
        >
          Statement
        </Button>

        {!user?.isReadOnly &&
          ( 
            <>
              <Button
                onClick={() => {
                  onClose();
                  onPayment(customer);
                }}
                variant="green-btn"
              >
                Payment
              </Button>

              <Button
                onClick={() => {
                  onClose();
                  onEdit(customer);
                }}
                variant="green-btn"
              >
                Edit
              </Button>

              <Button
                onClick={() => {
                  onClose();
                  onToggleStatus(customer);
                }}
                variant={isActive ? 'red-btn' : 'green-btn'}
              >
                {isActive ? 'In Active' : 'Active'}
              </Button>
            </>
          )
        }
      </div>
    </Modal>
  );
}
