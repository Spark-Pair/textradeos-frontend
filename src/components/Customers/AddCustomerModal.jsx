import { useState, useEffect } from "react";
import Modal from "../Modal";
import Input from "../Input";
import Button from "../Button";
import { useToast } from "../../context/ToastContext";

export default function AddCustomerModal({ onClose, onSave, initialData }) {
  const [form, setForm] = useState({
    name: "",
    person_name: "",
    phone_no: "",
    address: "",
  });

  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (initialData) {
      // Fill form for editing
      setForm({
        name: initialData.name || "",
        person_name: initialData.person_name || "",
        phone_no: initialData.phone_no || "",
        address: initialData.address || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (value) => {
    setForm({ ...form, type: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    onClose();
  };

  return (
    <Modal
      title={initialData ? "Edit Customer" : "Add Customer"}
      onClose={onClose}
      size="2xl"
    >
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Input
            label="Customer Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter customer name"
            required
          />
          <Input
            label="Person Name"
            name="person_name"
            value={form.person_name}
            onChange={handleChange}
            placeholder="Enter person name name"
            required
          />
          <Input
            label="Phone No."
            name="phone_no"
            value={form.phone_no}
            onChange={handleChange}
            placeholder="Enter phone no."
          />
          <Input
            label="Address"
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Enter address"
            required={false}
          />
        </div>

        <Button type="submit" className="w-full" disabled={saving}>
          {saving
            ? "Saving..."
            : initialData
            ? "Update Customer"
            : "Save Customer"}
        </Button>
      </form>
    </Modal>
  );
}
