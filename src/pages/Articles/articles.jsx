import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Button from "../../components/Button";
import AddArticleModal from "../../components/Articles/AddArticleModal";
import ArticleDetailsModal from "../../components/Articles/ArticleDetailsModal";
import Table from "../../components/Table";
import axiosClient from "../../api/axiosClient";
import { loadCachedThenNetwork, createItem, updateItem, postAction } from "../../offline/api";
import { dbPromise } from "../../offline/db";
import { formatDateWithDay } from "../../utils/index";
import { useToast } from "../../context/ToastContext";
import { Plus } from "lucide-react";
import AddStockModal from "../../components/Articles/AddStockModal";
import Filters from "../../components/Filters";
import PrintListBtn from "../../components/PrintListBtn";
import Pagination from "../../components/Pagination";
import { useAuth } from "../../context/AuthContext";

export default function Articles() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [addStockArticle, setAddStockArticle] = useState(null);
  const [editingArticle, setEditingArticle] = useState(null);

  const [articles, setArticles] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filtersActive, setFiltersActive] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    document.title = "Articles | TexTradeOS";
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await loadCachedThenNetwork({
        store: "articles",
        endpoint: "/articles/",
        axiosClient,
        bizId: user?.businessId?._id || user?.businessId || null,
        onCache: (cached) => {
          const cachedFlattened = cached.map((article) => ({
            ...article,
            reg_date: formatDateWithDay(article.createdAt),
          }));
          setArticles(cachedFlattened);
          setLoading(false);
        },
      });

      const flattened = data.map((article) => ({
        ...article,
        reg_date: formatDateWithDay(article.createdAt),
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
        await updateItem({
          store: "articles",
          endpoint: "/articles",
          axiosClient,
          id: editingArticle._id,
          payload: formData,
          bizId: user?.businessId?._id || user?.businessId || null,
        });
      } else {
        // 🟢 Create new
        await createItem({
          store: "articles",
          endpoint: "/articles",
          axiosClient,
          payload: formData,
          bizId: user?.businessId?._id || user?.businessId || null,
        });
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
      await postAction({
        endpoint: "/articles/add-stock",
        axiosClient,
        payload: formData,
        optimistic: async () => {
          const next = articles.map((a) =>
            a._id === formData.articleId
              ? { ...a, stock: (a.stock || 0) + Number(formData.quantity || 0) }
              : a
          );
          setArticles(next);
          const db = await dbPromise;
          const item = await db.get("articles", formData.articleId);
          if (item) {
            await db.put("articles", {
              ...item,
              stock: (item.stock || 0) + Number(formData.quantity || 0),
            });
          }
        },
      });
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
    { label: "#", render: (_, i) => i + 1, width: "3%" },
    { label: "Article No.", field: "article_no", width: "12%" },
    { label: "Season", field: "season", width: "12%", className: "capitalize" },
    { label: "Size", field: "size", width: "15%", align: "center", className: "capitalize" },
    { label: "Category", field: "category", width: "18%", align: "center", className: "capitalize" },
    { label: "Type", field: "type", width: "10%", align: "center", className: "capitalize" },
    { label: "Purchase Price", field: "purchase_price", width: "10%", align: "center" },
    { label: "Selling Price", field: "selling_price", width: "10%", align: "center" },
    { label: "Stock", field: "stock", width: "auto", align: "center" },
  ];

  const sourceData = filtersActive ? filteredData : articles;
  const totalPages = Math.max(1, Math.ceil(sourceData.length / pageSize));
  const pagedData = sourceData.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [filtersActive]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const contextMenuItems = [
    { label: "View Details", onClick: (article) => setSelectedArticle(article) },
    { label: "Edit", onClick: handleEdit },
  ];

  return (
    <div className="h-full overflow-hidden grid grid-rows-[auto_1fr] gap-4 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Articles</h1>

        <div className="flex gap-2">
          <PrintListBtn
            label="Article"
            columns={columns}
            data={articles}
            filtersActive={filtersActive}
            filteredData={filteredData}
            topSection={[
              { title: "Total Records", value: filtersActive ? filteredData.length : articles.length },
              { title: "Balance", value: "2050" },
            ]}
            firstPageRowCount={18}
            otherPageRowCount={19}
          />

          <Filters
            fields={[
              { name: "article_no", label: "Article No.", type: "text", field: "article_no" },
              {
                name: "season",
                label: "Season",
                type: "select",
                field: "season",
                options: [
                  { value: "half", label: "Half" },
                  { value: "full", label: "Full" },
                  { value: "winter", label: "Winter" },
                ],
              },
              {
                name: "size",
                label: "Size",
                type: "select",
                field: "size",
                options: [
                  { value: "0", label: "0" },
                  { value: "1-2", label: "1-2" },
                  { value: "s-m-l", label: "S-M-L" },
                  { value: "18-20-22", label: "18-20-22" },
                ],
              },
              {
                name: "category",
                label: "Category",
                type: "select",
                field: "category",
                options: [
                  { value: "1-pc", label: "1-Pc" },
                  { value: "2-pc", label: "2-Pc" },
                  { value: "3-pc", label: "3-Pc" },
                ],
              },
              {
                name: "type",
                label: "Type",
                type: "select",
                field: "type",
                options: [
                  { value: "baba", label: "Baba" },
                  { value: "baby", label: "Baby" },
                ],
              },
            ]}
            data={articles}
            onFiltered={(rows, active) => {
              setFilteredData(rows);
              setFiltersActive(active);
            }}
          />
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={pagedData}
        onRowClick={(article) => setSelectedArticle(article)}
        contextMenuItems={contextMenuItems}
        loading={loading}
        bottomButtonOnclick={() => {
          setEditingArticle(null);
          setIsModalOpen(true);
        }}
        bottomButtonIcon={<Plus size={16} />}
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

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
