import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Button from "../../components/Button";
import AddArticleModal from "../../components/Articles/AddArticleModal";
import ArticleDetailsModal from "../../components/Articles/ArticleDetailsModal";
import Table from "../../components/Table";
import axiosClient from "../../api/axiosClient";
import { formatDateWithDay } from "../../utils/dateFormatter";

export default function Articles() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [editingArticle, setEditingArticle] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Articles | TexTradeOS";
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get("/articles/");
      
      const flattened = data.map((biz) => ({
        ...biz,
        username: biz.userId?.username || "-",
        status: biz.isActive ? "Active" : "Inactive",
        reg_date: formatDateWithDay(biz.registration_date),
      }));
      setArticles(flattened);
      console.log(flattened);
      
    } catch (error) {
      console.error("Failed to load articles:", error);
      alert("Failed to load articles");
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
      alert(error.response?.data?.message || "Failed to save article");
    }
  };

  const handleEdit = (biz) => {
    setEditingArticle(biz);
    setIsModalOpen(true);
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
  ];

  const contextMenuItems = [
    { label: "View Details", onClick: (row) => console.log(row) },
    { label: "Edit", onClick: (row) => console.log("Edit:", row) },
    { label: "Delete", onClick: (row) => console.log("Delete:", row), danger: true },
  ];

  const handleToggleStatus = async (biz) => {
    setSelectedArticle(null)
    try {
      await axiosClient.patch(`/articles/${biz._id}/toggle`);
      await loadArticles();
    } catch (error) {
      console.error("Failed change status:", error);
      alert("Failed change status");
    }
  };

  return (
    <div className="w-full h-full overflow-hidden grid grid-rows-[auto_1fr] gap-4 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Articles</h1>
        <Button
          onClick={() => {
            setEditingArticle(null);
            setIsModalOpen(true);
          }}
        >
          Register Article
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={articles}
        onRowClick={(biz) => setSelectedArticle(biz)}
        contextMenuItems={contextMenuItems}
        loading={loading}
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

        {selectedArticle && (
          <ArticleDetailsModal
            article={selectedArticle}
            onClose={() => setSelectedArticle(null)}
            onEdit={handleEdit}
            onToggleStatus={handleToggleStatus}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
