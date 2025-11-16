import { useState, useEffect } from "react";
import Modal from "../Modal";
import Input from "../Input";
import Select from "../Select";
import Button from "../Button";
import { useToast } from "../../context/ToastContext";

export default function AddStockModal({ onClose, onSave, selectedArticle }) {
  const [form, setForm] = useState({
    articleId: selectedArticle._id,
    quantity: "",
  });

  const [saving, setSaving] = useState(false);
  const addToast = useToast();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);;

      await onSave(form);
      onClose();
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || "Failed to save stock", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={`Add Stock - ${selectedArticle.article_no}`}
      onClose={onClose}
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 mb-6">
          <Input
            label="Quantity"
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            placeholder="Enter quantity"
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={saving}>
          {saving
            ? "Saving..."
            : "Save Stock"}
        </Button>
      </form>
    </Modal>
  );
}
