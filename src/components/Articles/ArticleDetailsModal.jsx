import Modal from "../Modal";
import Button from "../Button";

export default function ArticleDetailsModal({ article, onClose, onEdit, onAddStock }) {
  if (!article) return null;

  const isActive = article.status === "Active";

  return (
    <Modal title={article.name} onClose={onClose} size="md">
      <div className="space-y-2 text-gray-700">
        <p><strong>Article No.:</strong> {article.article_no}</p>
        <p><strong>Season:</strong> {article.season}</p>
        <p><strong>Size:</strong> {article.size}</p>
        <p><strong>Category:</strong> {article.category}</p>
        <p><strong>Type:</strong> {article.type}</p>
        <p><strong>Purchase Price:</strong> {article.purchase_price}</p>
        <p><strong>Selling Price:</strong> {article.selling_price}</p>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button
          onClick={() => {
            onClose();
            onAddStock(article);
          }}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          Add Stock
        </Button>

        <Button
          onClick={() => {
            onClose();
            onEdit(article);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Edit
        </Button>

        <Button onClick={onClose} className="bg-gray-300 hover:bg-gray-400">
          Close
        </Button>
      </div>
    </Modal>
  );
}
