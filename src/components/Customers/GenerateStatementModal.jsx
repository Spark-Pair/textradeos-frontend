import { useState, useEffect } from "react";
import Modal from "../Modal";
import Input from "../Input";
import Button from "../Button";

export default function GenerateStatementModal({ onClose, onSave, initialData }) {
  const [form, setForm] = useState({
    date_from: "",
    date_to: new Date().toISOString().split("T")[0],
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    onClose();
  };

  return (
    <Modal
      title="Generate Statement"
      onClose={onClose}
      size="xl"
    >
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Input
            label="Date From"
            name="date_from"
            type="date"
            value={form.date_from}
            onChange={handleChange}
            placeholder="Enter date from"
            required
          />
          <Input
            label="Date To"
            name="date_to"
            type="date"
            value={form.date_to}
            onChange={handleChange}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={saving}>
          {saving
            ? "Generating..."
            : "Generate Statement"}
        </Button>
      </form>
    </Modal>
  );
}
