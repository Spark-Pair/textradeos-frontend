import { useState, useEffect } from "react";
import Modal from "../Modal";
import Input from "../Input";
import Select from "../Select";
import Button from "../Button";
import { useToast } from "../../context/ToastContext";

export default function AddBusinessModal({ onClose, onSave, initialData }) {
  const [form, setForm] = useState({
    name: "",
    owner: "",
    username: "",
    password: "",
    phone_no: "",
    registration_date: "",
    price: "",
    type: "",
  });

  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (initialData) {
      // Fill form for editing
      setForm({
        name: initialData.name || "",
        owner: initialData.owner || "",
        username: initialData.username || "",
        password: "", // keep blank for security
        phone_no: initialData.phone_no || "",
        registration_date: initialData.registration_date
          ? initialData.registration_date.split("T")[0]
          : "",
        price: initialData.price || "",
        type: initialData.type || "",
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
    try {
      setSaving(true);
      await onSave(form);
      onClose();
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || "Failed to save business", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={initialData ? "Edit Business" : "Add Business"}
      onClose={onClose}
      size="2xl"
    >
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Input
            label="Business Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter business name"
            className="capitalize"
            required
          />
          <Input
            label="Owner Name"
            name="owner"
            value={form.owner}
            onChange={handleChange}
            placeholder="Enter owner name"
            className="capitalize"
            required
          />
          <Input
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Enter username"
            className="lowercase"
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder={initialData ? "Leave blank to keep current" : "Enter password"}
          />
          <Input
            label="Phone No."
            name="phone_no"
            type="number"
            value={form.phone_no}
            onChange={handleChange}
            placeholder="Enter phone no."
          />
          <Input
            label="Registration Date"
            name="registration_date"
            type="date"
            value={form.registration_date}
            onChange={handleChange}
          />
          <Input
            label="Price"
            name="price"
            type="amount"
            allowDecimal
            value={form.price}
            onChange={handleChange}
            placeholder="Enter price"
          />
          <Select
            label="Type"
            options={[
              { value: "monthly", label: "Monthly" },
              { value: "yearly", label: "Yearly" },
            ]}
            value={form.type}
            onChange={handleSelectChange}
            placeholder="Select type"
          />
        </div>

        <Button type="submit" className="w-full" disabled={saving}>
          {saving
            ? "Saving..."
            : initialData
            ? "Update Business"
            : "Save Business"}
        </Button>
      </form>
    </Modal>
  );
}
