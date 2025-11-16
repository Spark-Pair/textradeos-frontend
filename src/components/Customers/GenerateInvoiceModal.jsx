import { useState, useEffect } from "react";
import Modal from "../Modal";
import Button from "../Button";
import { useToast } from "../../context/ToastContext";
import Table from "../Table";
import axiosClient from "../../api/axiosClient";
import { formatDateWithDay } from "../../utils";
import Input from "../Input";

export default function GenerateInvoiceModal({ onClose, invoicingCustomer }) {
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState([]);

  const [selectedArticles, setSelectedArticles] = useState({});
  const [discount, setDiscount] = useState(0);

  /** ---------- CALCULATED TOTALS ---------- **/
  const grossAmount = Object.values(selectedArticles).reduce(
    (sum, item) => sum + item.selling_price * item.quantity,
    0
  );

  const netAmount = grossAmount - (grossAmount * (discount / 100));

  /** ---------- HANDLE CHECKBOX ---------- **/
  const toggleArticle = (article, checked) => {
    setSelectedArticles(prev => {
      const copy = { ...prev };

      if (checked) {
        copy[article._id] = {
          ...article,
          quantity: 1
        };
      } else {
        delete copy[article._id];
      }

      return copy;
    });
  };

  /** ---------- HANDLE QUANTITY CHANGE ---------- **/
  const changeQuantity = (article, value) => {
    const qty = Number(value) || 1;

    setSelectedArticles(prev => ({
      ...prev,
      [article._id]: {
        ...prev[article._id],
        quantity: qty
      }
    }));
  };

  /** ---------- LOAD ARTICLES ---------- **/
  const loadArticles = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get("/articles/");

      const flattened = data.map(a => ({
        ...a,
        reg_date: formatDateWithDay(a.registration_date),
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

  /** ---------- TABLE COLUMNS WITH RENDER FUNCTIONS ---------- **/
  const columns = [
    {
      label: "",
      width: "26px",
      middleAlign: "center",
      render: (row) => (
        <input
          type="checkbox"
          checked={!!selectedArticles[row._id]}
          onChange={(e) => toggleArticle(row, e.target.checked)}
        />
      ),
    },
    {
      label: "Quantity",
      width: "15%",
      middleAlign: "center",
      render: (row) => (
        <input
          type="number"
          min="1"
          disabled={!selectedArticles[row._id]}
          value={selectedArticles[row._id]?.quantity || 1}
          onChange={(e) => changeQuantity(row, e.target.value)}
          className={`w-16 bg-[#f8fbfb] border border-gray-300 rounded-lg px-1.5 py-0.5 focus:outline-none text-gray-700 
          ${!selectedArticles[row._id] ? "opacity-40 cursor-not-allowed" : ""}`}
        />
      ),
    },
    { label: "Article No.", field: "article_no", width: "30%", middleAlign: "center" },
    { label: "Selling Price", field: "selling_price", width: "15%", middleAlign: "center", align: "center" },
    { label: "Stock", field: "stock", width: "15%", middleAlign: "center", align: "center" },
  ];

  const handleGenerate = async () => {
    try {
      if (Object.keys(selectedArticles).length === 0) {
        return addToast("Select at least one article", "error");
      }

      // Convert selectedArticles object → array
      const items = Object.values(selectedArticles).map(item => ({
        articleId: item._id,
        quantity: item.quantity,
      }));

      // TEMP: later we'll add customer selection — for now use a dummy or selected customer
      const customerId = invoicingCustomer?._id;

      const payload = {
        customerId,
        items,
        discount,
        grossAmount,
        netAmount,
      };

      const { data } = await axiosClient.post("/invoices", payload);

      addToast("Invoice generated successfully", "success");
      onClose(data); // close modal
    } catch (error) {
      console.error("Failed to generate invoice:", error);
      addToast(error.response?.data?.message || "Failed to generate invoice", "error");
    }
  };

  return (
    <Modal title={`Generate Invoice - ${invoicingCustomer?.name}`} onClose={onClose} size="4xl">
      <Table
        columns={columns}
        data={articles}
        loading={loading}
        height="60vh"
        bottomGap={false}
      />

      {/* Totals Section */}
      <div className="flex gap-4 mt-4">
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Gross Amount"
            type="labelInBox"
            value={grossAmount.toFixed(2)}
            readOnly
          />

          <Input
            label="Discount (%)"
            type="labelInBox"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            placeholder="0"
          />

          <Input
            label="Net Amount"
            type="labelInBox"
            value={netAmount.toFixed(2)}
            readOnly
          />
        </div>
        <div className="generate-btn flex">
          <Button
            onClick={handleGenerate}
            disabled={Object.keys(selectedArticles).length === 0}
          >
            Generate
          </Button>
        </div>
      </div>
    </Modal>
  );
}
