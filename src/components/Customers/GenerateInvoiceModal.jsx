import { useState, useEffect, useRef } from "react";
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
  const quantityRefs = useRef({});
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState({}); // track quantity/discount errors

  /** ---------- CALCULATED TOTALS ---------- **/
  const grossAmount = Object.values(selectedArticles).reduce(
    (sum, item) => sum + item.selling_price * item.quantity,
    0
  );
  const netAmount = grossAmount - grossAmount * (discount / 100);

  /** ---------- HANDLE CHECKBOX / ROW CLICK ---------- **/
  const toggleArticle = (article) => {
    setSelectedArticles(prev => {
      const copy = { ...prev };

      const isSelected = !!copy[article._id];

      if (isSelected) {
        // remove selection
        delete copy[article._id];
      } else {
        // add selection
        copy[article._id] = { ...article, quantity: 1 };

        // ⭐ auto-focus after DOM updates
        setTimeout(() => {
          quantityRefs.current[article._id]?.focus();
        }, 0);
      }

      return copy;
    });
  };

  /** ---------- HANDLE QUANTITY CHANGE ---------- **/
  const changeQuantity = (article, value) => {
    let qty = Number(value) || 1;

    // Clamp quantity to article stock
    if (qty > article.stock) qty = article.stock;
    if (qty < 1) qty = 1; // optional: minimum 1

    setSelectedArticles(prev => ({
      ...prev,
      [article._id]: {
        ...prev[article._id],
        quantity: qty
      }
    }));
  };

  /** ---------- HANDLE DISCOUNT CHANGE ---------- **/
  const handleDiscountChange = (value) => {
    let val = Number(value) || 0;
    if (val > 100) val = 100; // clamp
    if (val < 0) val = 0;     // optional: clamp negative
    setDiscount(val);
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
    } catch (err) {
      console.error("Failed to load articles:", err);
      addToast("Failed to load articles", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  /** ---------- TABLE COLUMNS ---------- **/
  const columns = [
    {
      label: "",
      width: "26px",
      middleAlign: "center",
      render: row => (
        <input
          type="checkbox"
          checked={!!selectedArticles[row._id]}
          readOnly
        />
      ),
    },
    {
      label: "Quantity",
      width: "15%",
      middleAlign: "center",
      render: row => {
        const selected = selectedArticles[row._id];
        const hasError = error[row._id];
        return (
          <input
            ref={(el) => (quantityRefs.current[row._id] = el)}
            type="number"
            min="1"
            disabled={!selected}
            value={selected?.quantity || 1}
            onChange={e => changeQuantity(row, e.target.value)}
            onClick={e => e.stopPropagation()} // ✅ prevent row toggle
            onFocus={e => e.target.select()}
            className={`w-16 px-1.5 py-0.5 rounded-lg border focus:outline-none
            ${!selected ? "opacity-40 cursor-not-allowed" : ""}
            ${hasError ? "border-red-500 bg-red-50" : "border-gray-300 bg-[#f8fbfb]"}
          `}
          />
        );
      },
    },
    { label: "Article No.", field: "article_no", width: "30%", middleAlign: "center" },
    { label: "Selling Price", field: "selling_price", width: "15%", middleAlign: "center", align: "center" },
    { label: "Stock", field: "stock", width: "15%", middleAlign: "center", align: "center" },
  ];

  /** ---------- GENERATE INVOICE ---------- **/
  const handleGenerate = async () => {
    if (Object.keys(selectedArticles).length === 0) {
      return addToast("Select at least one article", "error");
    }

    if (Object.values(error).some(Boolean)) {
      return addToast("Fix errors before generating invoice", "error");
    }

    try {
      const items = Object.values(selectedArticles).map(item => ({
        articleId: item._id,
        quantity: item.quantity,
      }));

      const payload = {
        customerId: invoicingCustomer?._id,
        items,
        discount,
        grossAmount,
        netAmount,
      };

      const { data } = await axiosClient.post("/invoices", payload);

      addToast("Invoice generated successfully", "success");
      onClose(data);
    } catch (err) {
      console.error("Failed to generate invoice:", err);
      addToast(err.response?.data?.message || "Failed to generate invoice", "error");
    }
  };

  /** ---------- HANDLE ROW CLICK ---------- **/
  const handleRowClick = (article) => {
    toggleArticle(article);
  };

  return (
    <Modal title={`Generate Invoice - ${invoicingCustomer?.name}`} onClose={onClose} size="4xl" >
      <Table
        columns={columns}
        data={articles}
        loading={loading}
        height="60vh"
        bottomGap={false}
        onRowClick={handleRowClick} // ✅ clicking row toggles checkbox
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
            onChange={e => handleDiscountChange(e.target.value)}
            onFocus={e => e.target.select()}
            placeholder="0"
            className={error.discount ? "border-red-500 bg-red-50" : ""}
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
            disabled={
              Object.keys(selectedArticles).length === 0 ||
              Object.values(error).some(Boolean)
            }
          >
            Generate
          </Button>
        </div>
      </div>
    </Modal>
  );
}
