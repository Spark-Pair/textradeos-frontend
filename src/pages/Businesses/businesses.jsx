import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import Button from "../../components/Button";
import AddBusinessModal from "../../components/Businesses/AddBusinessModal";
import Modal from "../../components/Modal";

export default function Businesses() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  useEffect(() => {
    document.title = "Businesses | TexTradeOS";
  }, []);

  const businesses = [
    { id: 1, name: "TexTrade Garments", owner: "Andrew", location: "Karachi" },
    { id: 2, name: "Alpha Textiles", owner: "Hasan", location: "Lahore" },
    { id: 3, name: "BlueThread Mills", owner: "Ali", location: "Faisalabad" },
  ];

  // close context menu when clicked anywhere
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  return (
    <div className="w-full h-full overflow-hidden grid grid-rows-[auto_1fr] gap-4">
      {/* 🔹 Header Section */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Businesses</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>Add Business</Button>
      </div>

      {/* 🔹 Table Container */}
      <div className="border border-gray-300 rounded-2xl p-1 shadow-sm grid grid-rows-[auto_1fr] overflow-hidden">
        {/* Header Row */}
        <div className="grid [grid-template-columns:60px_1.5fr_1fr_1fr] bg-[#127475] text-white rounded-xl px-4 py-1.5">
          <div>#</div>
          <div>Business Name</div>
          <div>Owner</div>
          <div>Location</div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto pb-12">
          {businesses.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No businesses found.
            </div>
          ) : (
            businesses.map((biz, index) => (
              <div
                key={biz.id}
                onClick={() => setSelectedBusiness(biz)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu({
                    x: e.pageX,
                    y: e.pageY,
                    business: biz,
                  });
                }}
                className="grid [grid-template-columns:60px_1.5fr_1fr_1fr] border-b border-gray-300 px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                <div>{index + 1}</div>
                <div>{biz.name}</div>
                <div>{biz.owner}</div>
                <div>{biz.location}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 🔹 Context Menu */}
      {contextMenu && (
        <div
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
          }}
          className="absolute z-50 bg-white border border-gray-300 rounded-md shadow-lg w-44 py-1"
        >
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            onClick={() => {
              setSelectedBusiness(contextMenu.business);
              setContextMenu(null);
            }}
          >
            View Details
          </button>
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            onClick={() => {
              alert(`Edit: ${contextMenu.business.name}`);
              setContextMenu(null);
            }}
          >
            Edit
          </button>
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
            onClick={() => {
              alert(`Delete: ${contextMenu.business.name}`);
              setContextMenu(null);
            }}
          >
            Delete
          </button>
        </div>
      )}

      {/* 🔹 Modals */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <AddBusinessModal onClose={() => setIsCreateModalOpen(false)} />
        )}

        {selectedBusiness && (
          <Modal
            title={selectedBusiness.name}
            onClose={() => setSelectedBusiness(null)}
            size="md"
          >
            <div className="space-y-2 text-gray-700">
              <p>
                <strong>Owner:</strong> {selectedBusiness.owner}
              </p>
              <p>
                <strong>Location:</strong> {selectedBusiness.location}
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => alert("Edit feature coming soon")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit
              </button>
              <button
                onClick={() => setSelectedBusiness(null)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
