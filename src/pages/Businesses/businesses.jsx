import { useEffect, useState } from "react";
import Button from "../../components/Button";
import AddBusinessModal from "../../components/Businesses/AddBusinessModal";
import { AnimatePresence } from "framer-motion";

export default function Businesses() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    document.title = "Businesses | TexTradeOS";
  }, []);

  // Example static data
  const businesses = [
    { id: 1, name: "TexTrade Garments", owner: "Andrew", location: "Karachi" },
    { id: 2, name: "Alpha Textiles", owner: "Hasan", location: "Lahore" },
    { id: 3, name: "BlueThread Mills", owner: "Ali", location: "Faisalabad" },
  ];

  return (
    <div className="p-6 w-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Businesses</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>Add Business</Button>
      </div>

      {/* Table container */}
      <div
        id="tableContainer"
        className="border border-gray-300 rounded-2xl p-1 shadow-sm"
      >
        {/* Header Row */}
        <div className="grid [grid-template-columns:60px_1.5fr_1fr_1fr] bg-[#127475] text-white rounded-xl px-4 py-1.5">
          <div>#</div>
          <div>Business Name</div>
          <div>Owner</div>
          <div>Location</div>
        </div>

        {/* Data Rows */}
        {businesses.map((biz, index) => (
          <div
            key={biz.id}
            className={`grid [grid-template-columns:60px_1.5fr_1fr_1fr] border-b border-gray-300 last:border-0 px-4 py-2`}
          >
            <div>{index + 1}</div>
            <div>{biz.name}</div>
            <div>{biz.owner}</div>
            <div>{biz.location}</div>
          </div>
        ))}

        {/* Empty State */}
        {businesses.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No businesses found.
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <AddBusinessModal onClose={() => setIsCreateModalOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
