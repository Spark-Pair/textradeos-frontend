import { useState, useEffect } from "react";
import Modal from "../Modal";
import Button from "../Button";
import { useToast } from "../../context/ToastContext";
import Table from "../Table";
import axiosClient from "../../api/axiosClient";
import { formatDateWithDay } from "../../utils";
import Input from "../Input";

export default function GenerateInvoiceModal({ onClose }) {
  const [form, setForm] = useState({
    name: "",
    person_name: "",
    phone_no: "",
    address: "",
  });

  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState([]);

  const columns = [
    { label: "", width: "26px", middleAlign: "center", align: "left", render: () => <input type="checkbox" /> },
    { label: "Quantity", width: "15%", middleAlign: "center", render: () => <input type="number" min="1" defaultValue="1" className="w-16 bg-[#f8fbfb] border border-gray-300 rounded-lg px-1.5 py-0.5 focus:outline-none text-gray-700" /> },
    { label: "Article No.", field: "article_no", width: "30%", middleAlign: "center" },
    { label: "Selling Price", field: "selling_price", width: "15%", middleAlign: "center", align: "center" },
    { label: "Stock", field: "stock", width: "15%", middleAlign: "center", align: "center" },
  ];

  const loadArticles = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get("/articles/");
      
      const flattened = data.map((article) => ({
        ...article,
        reg_date: formatDateWithDay(article.registration_date),
      }));
      setArticles(flattened);
      
    } catch (error) {
      console.error("Failed to load articles:", error);
      addToast("Failed to load articles", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  return (
    <Modal
      title="Generate Invoice"
      onClose={onClose}
      size="4xl"
    >
      <Table
        columns={columns}
        data={articles}
        loading={loading}
        height="500px"
        bottomGap={false}
      />
      <div className="grid grid-cols-3 gap-4 mt-4">
        {/* 3 inputs: gross amount, discount, net amount */}
        <Input
          label="Gross Amount"
          type="labelInBox"
          value=""
          placeholder="0.00"
        />
        <Input
          label="Gross Amount"
          type="labelInBox"
          value=""
          placeholder="0.00"
        />
        <Input
          label="Gross Amount"
          type="labelInBox"
          value=""
          placeholder="0.00"
        />
      </div>
    </Modal>
  );
}
