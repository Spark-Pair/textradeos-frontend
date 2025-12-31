import { useState, useEffect, useRef } from "react";
import { User, UserPlus, ArrowLeft, RotateCcw } from "lucide-react";
import Modal from "../Modal";
import Button from "../Button";
import { useToast } from "../../context/ToastContext";
import Table from "../Table";
import axiosClient from "../../api/axiosClient";
import { formatDateWithDay } from "../../utils";
import Input from "../Input";
import Select from "../Select";

export default function GenerateInvoiceModal({ onClose, onSave }) {
  const { addToast } = useToast();

  const [step, setStep] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState([]);
  const [allArticles, setAllArticles] = useState([]);
  const [selectedArticles, setSelectedArticles] = useState({});
  const quantityRefs = useRef({});
  const [discount, setDiscount] = useState(0);
  const [generating, setGenerating] = useState(false);

  // 1. Date State (Default to today)
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);

  // Aaj ki date for "max" attribute
  const today = new Date().toISOString().split("T")[0];

  const grossAmount = Object.values(selectedArticles).reduce((sum, item) => sum + item.selling_price * item.quantity, 0);
  const netAmount = grossAmount * (1 - discount / 100);

  const getModalTitle = () => {
    if (step === 1) return "Select Customer Type";
    if (step === 2) return "Select Customer";
    return `Select Articles`;
  };

  const loadCustomers = async () => {
    try {
      const { data } = await axiosClient.get("/customers");
      setCustomers(data.map(c => ({ value: c._id, label: c.name, ...c })));
    } catch (err) {
      addToast("Failed to load customers", "error");
    }
  };

  const loadArticles = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get("/articles/");
      setArticles(data.map(a => ({ ...a, reg_date: formatDateWithDay(a.registration_date) })));
      setAllArticles(data);
    } catch (err) {
      addToast("Failed to load articles", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step === 2) loadCustomers();
    if (step === 3) loadArticles();
  }, [step]);

  const handleTypeSelection = (type) => {
    if (type === "walk-in") {
      setSelectedCustomer({ name: "Walk-in Customer", _id: null });
      setStep(3);
    } else {
      setStep(2);
    }
  };

  const handleGenerate = async () => {
    if (Object.keys(selectedArticles).length === 0) {
      return addToast("Select at least one article", "error");
    }

    try {
      setGenerating(true);
      const payload = {
        customerId: selectedCustomer?._id || null, 
        date: invoiceDate, // 2. Payload mein date add kar di
        items: Object.values(selectedArticles).map(item => ({
          articleId: item._id,
          quantity: item.quantity,
        })),
        discount,
        grossAmount,
        netAmount,
      };

      await onSave(payload); 
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to generate invoice", "error");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Modal 
      title={getModalTitle()} 
      onClose={onClose} 
      size={step === 3 ? "4xl" : "lg"}
      withSearchBar={step === 3}
      onSearch={(term) => setArticles(allArticles.filter(a => a.article_no.toLowerCase().includes(term.toLowerCase())))}
    >
      {/* STEPS 1 & 2 remain same... */}
      {step === 1 && (
        <div className="grid grid-cols-2 gap-6 p-8">
          <div onClick={() => handleTypeSelection("walk-in")} className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all group">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-100">
              <User className="w-8 h-8 text-gray-600 group-hover:text-emerald-600" />
            </div>
            <span className="font-semibold text-gray-700 group-hover:text-emerald-700 text-center">Walk-in Customer</span>
          </div>
          <div onClick={() => handleTypeSelection("registered")} className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all group">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-100">
              <UserPlus className="w-8 h-8 text-gray-600 group-hover:text-emerald-600" />
            </div>
            <span className="font-semibold text-gray-700 group-hover:text-emerald-700 text-center">Registered Customer</span>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-6 p-8">
          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700 px-1">Search Customer</label>
            <Select 
              options={customers}
              onChange={(val) => {
                const cust = customers.find(c => c.value === val);
                setSelectedCustomer(cust);
                setStep(3);
              }}
              placeholder="Start typing customer name..."
            />
          </div>
          <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors w-fit" onClick={() => setStep(1)}>
            <ArrowLeft size={16} /> Back to selection
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="p-1">
          {/* Customer & Date Info Bar */}
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200/70 px-4 py-2 rounded-xl mb-4">
            <div className="flex items-center gap-4">
              {/* Customer Display */}
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase tracking-wider text-gray-400 font-bold">Customer :</span>
                <span className="text-xs uppercase font-bold text-gray-800">{selectedCustomer?.name}</span>
              </div>

              {/* Vertical Separator */}
              <div className="w-[1px] h-6 bg-emerald-200/70"></div>

              {/* Date Input Field */}
              <div className="flex items-center gap-3">
                <span className="text-xs uppercase text-nowrap tracking-wider text-emerald-600 font-bold">Invoice Date :</span>
                <input 
                  type="date" 
                  value={invoiceDate}
                  max={today}
                  // focus hote hi picker kholne ke liye
                  onFocus={(e) => e.target.showPicker()} 
                  onClick={(e) => e.target.showPicker()}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="text-sm font-bold text-gray-700 bg-transparent border-none p-0 focus:ring-0 cursor-pointer hover:text-emerald-600 transition-colors outline-none"
                />
                {/* Decorative line to show it's editable */}
                <div className="h-[1.5px] w-full bg-emerald-100 group-hover:bg-emerald-400 transition-all"></div>
              </div>
            </div>

            <button 
              onClick={() => setStep(1)} 
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 px-3 py-2 rounded-lg transition-all"
            >
              <RotateCcw size={14} /> Change Customer
            </button>
          </div>

          <Table
            columns={[
              { label: "", width: "26px", render: row => <input type="checkbox" checked={!!selectedArticles[row._id]} readOnly /> },
              {
                label: "Quantity",
                width: "15%",
                render: row => {
                  const selected = selectedArticles[row._id];
                  return (
                    <input
                      ref={(el) => (quantityRefs.current[row._id] = el)}
                      type="number" min="1" disabled={!selected}
                      value={selected?.quantity || 1}
                      onChange={e => {
                        let qty = Math.min(Math.max(1, Number(e.target.value)), row.stock);
                        setSelectedArticles(prev => ({ ...prev, [row._id]: { ...prev[row._id], quantity: qty } }));
                      }}
                      onClick={(e) => { e.stopPropagation(); if (selected) e.target.select(); }}
                      onFocus={(e) => e.target.select()}
                      className={`w-16 px-1.5 py-0.5 rounded-lg border focus:outline-none ${!selected ? "opacity-40 cursor-not-allowed" : "border-gray-300 bg-[#f8fbfb] focus:border-emerald-500"}`}
                    />
                  );
                },
              },
              { label: "Article No.", field: "article_no", width: "auto" },
              { label: "Price", field: "selling_price", width: "15%", align: "center" },
              { label: "Stock", field: "stock", width: "11%", align: "center" },
            ]}
            data={articles} loading={loading} height="55vh"
            onRowClick={(article) => {
              setSelectedArticles(prev => {
                const copy = { ...prev };
                if (copy[article._id]) { delete copy[article._id]; } 
                else { copy[article._id] = { ...article, quantity: 1 }; setTimeout(() => { quantityRefs.current[article._id]?.focus(); }, 0); }
                return copy;
              });
            }}
          />

          <div className="flex gap-4 items-end pt-4">
            <div className="grid grid-cols-3 gap-4 flex-1">
              <Input label="Gross Amount" type="labelInBox" value={grossAmount.toFixed(2)} readOnly />
              <Input label="Discount (%)" type="labelInBox" value={discount} onFocus={(e) => e.target.select()} onChange={e => setDiscount(Math.min(100, Number(e.target.value) || 0))} />
              <Input label="Net Amount" type="labelInBox" value={netAmount.toFixed(2)} readOnly />
            </div>
            <div className="mb-1">
              <Button onClick={handleGenerate} disabled={Object.keys(selectedArticles).length === 0 || generating}>
                {generating ? "Generating..." : "Generate"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}