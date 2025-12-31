import Modal from "../Modal";
import Button from "../Button";
import DetailItem from "../DetailItem";
import { useAuth } from "../../context/AuthContext";


export default function ArticleDetailsModal({ article, onClose, onEdit, onAddStock }) {
  const { user } = useAuth();
  if (!article) return null;

  const isActive = article.status === "Active";

  return (
    <Modal title={`Article Details - ${article.article_no}`} onClose={onClose} size="xl">
      <hr className="border-gray-300 mt-2 mb-4.5" />

      {/* --- Details Grid --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 px-3">
        {/* Group 1: Core Product Info */}
        <div className="sm:col-span-1">
          <h4 className="text-base font-semibold text-gray-800 mb-2 border-b-2 border-[#127475] inline-block">General Info</h4>
          <div className="space-y-1">
            <DetailItem label="Season" value={article.season} />
            <DetailItem label="Category" value={article.category} />
            <DetailItem label="Type" value={article.type} />
            <DetailItem label="Size" value={article.size} />
          </div>
        </div>
        
        {/* Group 2: Pricing Info */}
        <div className="sm:col-span-1">
          <h4 className="text-base font-semibold text-gray-800 mb-2 border-b-2 border-[#127475] inline-block">Pricing</h4>
          <div className="space-y-1">
            <DetailItem 
              label="Purchase Price" 
              value={article.purchase_price} 
            />
            <DetailItem 
              label="Selling Price" 
              value={article.selling_price} 
            />
          </div>
        </div>
      </div>

      {/* --- Actions --- */}
      <div className="mt-8 flex justify-end gap-3">
        
        {!user?.isReadOnly &&
          ( 
            <>
              <Button
                onClick={() => {
                  onClose();
                  onAddStock(article);
                }}
                variant="green-btn"
              >
                Add Stock
              </Button>

              <Button
                onClick={() => {
                  onClose();
                  onEdit(article);
                }}
                variant="green-btn"
              >
                Edit Article
              </Button>
            </>
          )
        }

        <Button 
          onClick={onClose} 
          variant="secondary-btn"
        >
          Close
        </Button>
      </div>
    </Modal>
  );
}