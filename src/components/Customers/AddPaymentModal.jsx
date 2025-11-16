import { useState, useEffect } from "react";
import Modal from "../Modal";
import Input from "../Input";
import Button from "../Button";
import Select from "../Select";

export default function AddPaymentModal({ onClose, onSave, selectedCustomer }) {
  const [form, setForm] = useState({
    customerId: selectedCustomer?._id || "",
    method: "cash",
    amount: "",
    remarks: "",
    date: new Date().toISOString().slice(0, 10),

    // Online
    bank: "",
    transaction_id: "",

    // Slip
    slip_date: "",
    clear_date: "",
    slip_no: "",

    // Cheque
    cheque_no: "",
    cheque_date: "",
    cheque_bank: "",
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleMethodChange = (value) => {
    setForm({ ...form, method: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    onClose();
  };

  return (
    <Modal title={`Add Payment - ${selectedCustomer?.name}`} onClose={onClose} size="2xl">
      <form onSubmit={handleSubmit}>
        
        {/* Method Dropdown */}
        <Select
          label="Method"
          options={[
            { value: "cash", label: "Cash" },
            { value: "online", label: "Online" },
            { value: "slip", label: "Slip" },
            { value: "cheque", label: "Cheque" },
          ]}
          value={form.method}
          onChange={handleMethodChange}
          placeholder="Select method"
        />

        {/* Common Fields */}
        <div className="grid grid-cols-2 gap-4 my-4">
          <Input
            label="Amount"
            name="amount"
            type="amount"
            placeholder="Enter amount"
            value={form.amount}
            onChange={handleChange}
            required
          />

          <Input
            label="Date"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            required
          />
        </div>

        <Input
          label="Remarks"
          name="remarks"
          value={form.remarks}
          onChange={handleChange}
          placeholder="Enter remarks"
          className="mb-4"
          required={false}
        />

        {/* Online Fields */}
        {form.method === "online" && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input
              label="Bank"
              name="bank"
              value={form.bank}
              placeholder="Enter bank"
              onChange={handleChange}
              required
            />
            <Input
              label="Transaction ID"
              name="transaction_id"
              value={form.transaction_id}
              placeholder="Enter transaction ID"
              onChange={handleChange}
              required
            />
          </div>
        )}

        {/* Slip Fields */}
        {form.method === "slip" && (
          <div className="grid grid-cols-3 gap-4 mb-4">
            <Input
              label="Slip Date"
              name="slip_date"
              type="date"
              value={form.slip_date}
              onChange={handleChange}
              required
            />
            <Input
              label="Clear Date"
              name="clear_date"
              type="date"
              value={form.clear_date}
              onChange={handleChange}
              required={false}
            />
            <Input
              label="Slip No."
              name="slip_no"
              value={form.slip_no}
              placeholder="Enter slip number"
              onChange={handleChange}
              required
            />
          </div>
        )}

        {/* Cheque Fields */}
        {form.method === "cheque" && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Input
              label="Bank"
              name="cheque_bank"
              value={form.cheque_bank}
              placeholder="Enter bank"
              onChange={handleChange}
              required
            />
            <Input
              label="Cheque No."
              name="cheque_no"
              value={form.cheque_no}
              placeholder="Enter cheque number"
              onChange={handleChange}
              required
            />
            <Input
              label="Cheque Date"
              name="cheque_date"
              type="date"
              value={form.cheque_date}
              onChange={handleChange}
              required
            />
            <Input
              label="Clear Date"
              name="clear_date"
              type="date"
              value={form.clear_date}
              onChange={handleChange}
              required={false}
            />
          </div>
        )}

        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? "Saving..." : "Save Payment"}
        </Button>
      </form>
    </Modal>
  );
}
