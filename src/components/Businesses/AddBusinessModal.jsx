import { useState } from "react";
import Input from "../Input";
import Button from "../Button";
import Modal from "../Modal";
import Select from "../Select";

export default function AddBusinessModal({ onClose }) {
  const [form, setForm] = useState({
    name: "",
    owner: "",
    username: "",
    password: "",
    phone_no: "",
    joining_date: "",
    price: "",
    type: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (value) => {
    setForm({ ...form, type: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("New Business Data:", form);
    // TODO: send data to API
    onClose(); // close modal after submit
  };

  return (
    <Modal title="Add Business" onClose={onClose} size="2xl">
      {/* Form */}
      <form className="" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Input
            label="Business Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter business name"
            required
          />

          <Input
            label="Owner Name"
            name="owner"
            value={form.owner}
            onChange={handleChange}
            placeholder="Enter owner name"
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
            value={form.password}
            onChange={handleChange}
            placeholder="Enter password"
            required
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
            label="Joining Date"
            name="joining_date"
            type="date"
            value={form.joining_date}
            onChange={handleChange}
            placeholder="Enter joining date"
          />

          <Input
            label="Price"
            name="price"
            type="amount"
            allowDecimal={true}
            value={form.price}
            onChange={handleChange}
            placeholder="Enter price"
          />

          <div>
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
        </div>

        <Button type="submit" className="w-full">
          Save Business
        </Button>
      </form>
    </Modal>
  );
}