import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Button from "../../components/Button";
import AddArticleModal from "../../components/Articles/AddArticleModal";
import ArticleDetailsModal from "../../components/Articles/ArticleDetailsModal";
import Table from "../../components/Table";
import axiosClient from "../../api/axiosClient";
import { formatDateWithDay } from "../../utils/index";
import { useToast } from "../../context/ToastContext";
import { Plus } from "lucide-react";
import AddStockModal from "../../components/Articles/AddStockModal";

export default function Articles() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [addStockArticle, setAddStockArticle] = useState(null);
  const [editingArticle, setEditingArticle] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    document.title = "Articles | TexTradeOS";
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get("/articles/");
      
      const flattened = data.map((article) => ({
        ...article,
        username: article.userId?.username || "-",
        status: article.isActive ? "Active" : "Inactive",
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

  const handleAddOrUpdateArticle = async (formData) => {
    try {
      if (editingArticle) {
        // 🟢 Update existing
        await axiosClient.put(`/articles/${editingArticle._id}`, formData);
      } else {
        // 🟢 Create new
        await axiosClient.post("/articles/", formData);
      }
      await loadArticles();
      setIsModalOpen(false);
      setEditingArticle(null);
    } catch (error) {
      console.error("Failed to save article:", error);
      addToast(error.response?.data?.message || "Failed to save article", "error");
    }
  };

  const handleSubmitAddStock = async (formData) => {
    try {
      await axiosClient.post("/articles/add-stock", formData);
      await loadArticles();
      setIsAddStockModalOpen(false);
      setAddStockArticle(null);
    } catch (error) {
      console.error("Failed to add stock:", error);
      addToast(error.response?.data?.message || "Failed to add stock", "error");
    }
  };

  const handleEdit = (article) => {
    setEditingArticle(article);
    setIsModalOpen(true);
  };

  const handleAddStock = (article) => {
    setAddStockArticle(article);
    setIsAddStockModalOpen(true);
  };

  const columns = [
    { label: "#", render: (_, i) => i + 1, width: "40px" },
    { label: "Article No.", field: "article_no", width: "12%" },
    { label: "Season", field: "season", width: "12%" },
    { label: "Size", field: "size", width: "15%", align: "center" },
    { label: "Category", field: "category", width: "18%", align: "center" },
    { label: "Type", field: "type", width: "10%", align: "center",},
    { label: "Purchase Price", field: "purchase_price", width: "10%", align: "center",},
    { label: "Selling Price", field: "selling_price", width: "10%", align: "center" },
    { label: "Stock", field: "stock", width: "auto", align: "center" },
  ];

  const contextMenuItems = [
    { label: "View Details", onClick: (article) => setSelectedArticle(article) },
    { label: "Edit", onClick: handleEdit },
  ];

  return (
    <div className="w-full h-full overflow-hidden grid grid-rows-[auto_1fr] gap-4 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Articles</h1>
        <Button>
          Filter
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={articles}
        onRowClick={(article) => setSelectedArticle(article)}
        contextMenuItems={contextMenuItems}
        loading={loading}
        bottomButtonOnclick={() => {
            setEditingArticle(null);
            setIsModalOpen(true);
          }}
        bottomButtonIcon={<Plus size={16} />}
      />

      {/* Modals */}
      <AnimatePresence>
        {isModalOpen && (
          <AddArticleModal
            onClose={() => {
              setIsModalOpen(false);
              setEditingArticle(null);
            }}
            onSave={handleAddOrUpdateArticle}
            initialData={editingArticle} // 👈 prefill data
          />
        )}

        {isAddStockModalOpen && (
          <AddStockModal
            selectedArticle={addStockArticle}
            onClose={() => setIsAddStockModalOpen(null)}
            onSave={handleSubmitAddStock}
          />
        )}

        {selectedArticle && (
          <ArticleDetailsModal
            article={selectedArticle}
            onClose={() => setSelectedArticle(null)}
            onEdit={handleEdit}
            onAddStock={handleAddStock}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
