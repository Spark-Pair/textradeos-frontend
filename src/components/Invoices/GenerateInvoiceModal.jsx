import { useState, useEffect } from "react";
import Modal from "../Modal";
import Input from "../Input";
import Select from "../Select";
import Button from "../Button";
import { useToast } from "../../context/ToastContext";

export default function AddInvoiceModal({ onClose, onSave, initialData }) {
  const [form, setForm] = useState({
    invoice_no: "",
    season: "",
    size: "",
    category: "",
    type: "",
    initial_stock: "",
    purchase_price: "",
    selling_price: "",
  });

  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (initialData) {
      setForm({
        invoice_no: initialData.invoice_no || "",
        season: initialData.season || "",
        size: initialData.size || "",
        category: initialData.category || "",
        type: initialData.type || "",
        initial_stock: initialData.initial_stock || "",
        purchase_price: initialData.purchase_price || "",
        selling_price: initialData.selling_price || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      const payload = {
        ...form,
        purchase_price: parseFloat(form.purchase_price) || 0,
        selling_price: parseFloat(form.selling_price) || 0,
      };

      await onSave(payload);
      onClose();
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || "Failed to save invoice", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={initialData ? "Edit Invoice" : "Add Invoice"}
      onClose={onClose}
      size="2xl"
    >
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Input
            label="Invoice No."
            name="invoice_no"
            value={form.invoice_no}
            onChange={handleChange}
            placeholder="Enter invoice no."
            required
          />

          <Select
            label="Season"
            options={[
              { value: "half", label: "Half" },
              { value: "full", label: "Full" },
              { value: "winter", label: "Winter" },
            ]}
            value={form.season}
            onChange={(value) => handleSelectChange("season", value)}
            placeholder="Select season"
          />

          <Select
            label="Size"
            options={[
              { value: "1-2", label: "1-2" },
              { value: "s-m-l", label: "S-M-L" },
              { value: "18-20-22", label: "18-20-22" },
            ]}
            value={form.size}
            onChange={(value) => handleSelectChange("size", value)}
            placeholder="Select size"
          />

          <Select
            label="Category"
            options={[
              { value: "1-pc", label: "1-Pc" },
              { value: "2-pc", label: "2-Pc" },
              { value: "3-pc", label: "3-Pc" },
            ]}
            value={form.category}
            onChange={(value) => handleSelectChange("category", value)}
            placeholder="Select category"
          />

          <Select
            label="Type"
            options={[
              { value: "baba", label: "Baba" },
              { value: "baby", label: "Baby" },
            ]}
            value={form.type}
            onChange={(value) => handleSelectChange("type", value)}
            placeholder="Select type"
          />

          <Input
            label="Initial Stock"
            name="initial_stock"
            type="number"
            value={form.initial_stock}
            onChange={handleChange}
            placeholder="Enter initial stock"
            required
          />

          <Input
            label="Purchase Price"
            name="purchase_price"
            type="amount"
            step="0.01"
            value={form.purchase_price}
            onChange={handleChange}
            placeholder="Enter purchase price"
            required
          />

          <Input
            label="Selling Price"
            name="selling_price"
            type="amount"
            step="0.01"
            value={form.selling_price}
            onChange={handleChange}
            placeholder="Enter selling price"
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={saving}>
          {saving
            ? "Saving..."
            : initialData
            ? "Update Invoice"
            : "Save Invoice"}
        </Button>
      </form>
    </Modal>
  );
}
