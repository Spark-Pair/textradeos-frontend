import React, { useState, useEffect } from "react";

/**
 * Reusable Table Component
 * Props:
 * - columns: [{ label, field?, render?, width?, align?, className? }]
 * - data: array of objects
 * - onRowClick: function(row)
 * - contextMenuItems: [{ label, onClick(row), danger? }]
 * - emptyText: fallback text if no records
 * - loading: boolean (optional)
 */
export default function Table({
  columns = [],
  data = [],
  onRowClick,
  contextMenuItems = [],
  emptyText = "No records found.",
  loading = false,
  height = "auto",
  bottomGap = true,
}) {
  const [contextMenu, setContextMenu] = useState(null);

  // Handle right click for context menu
  const handleRightClick = (e, row) => {
    e.preventDefault();
    if (contextMenuItems.length === 0) return;
    setContextMenu({ x: e.pageX, y: e.pageY, row });
  };

  // Hide context menu on outside click
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  // Column widths
  const gridTemplateColumns = columns.map(col => col.width || "1fr").join(" ");

  const getAlignClass = (align) => {
    switch (align) {
      case "center":
        return "text-center justify-center";
      case "right":
        return "text-right justify-end";
      default:
        return "text-left justify-start";
    }
  };

  const getMiddleAlignClass = (align) => {
    switch (align) {
      case "center":
        return "flex items-center";
      case "right":
        return "flex items-right";
      default:
        return "flex items-left";
    }
  };

  return (
    <div className={`h-[${height}] relative border border-gray-300 rounded-2xl p-1 shadow-sm grid grid-rows-[auto_1fr] overflow-hidden text-nowrap bg-white`}>
      {/* Header */}
      <div
        className="grid bg-[#127475] text-white rounded-xl px-4 py-2 font-semibold"
        style={{ gridTemplateColumns }}
      >
        {columns.map((col, idx) => (
          <div
            key={idx}
            className={`truncate ${getAlignClass(col.align)} ${getMiddleAlignClass(col.middleAlign)} ${col.className || ""}`}
          >
            {col.label}
          </div>
        ))}
      </div>

      {/* Body */}
      <div className={`overflow-y-auto max-h-[70vh] ${bottomGap ? 'pb-12' : ""}`}>
        {loading ? (
          <div className="p-6 text-center text-gray-500 animate-pulse">
            Loading...
          </div>
        ) : data.length === 0 ? (
          <div className="p-6 text-center text-gray-500">{emptyText}</div>
        ) : (
          data.map((row, rowIndex) => (
            <div
              key={row._id || row.id || rowIndex}
              onClick={() => onRowClick && onRowClick(row)}
              onContextMenu={(e) => handleRightClick(e, row)}
              className="grid border-b border-gray-200 px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
              style={{ gridTemplateColumns }}
            >
              {columns.map((col, colIndex) => (
                <div
                  key={colIndex}
                  className={`truncate ${getAlignClass(col.align)} ${getMiddleAlignClass(col.middleAlign)} ${col.className || ""}`}
                >
                  {typeof col.render === "function"
                    ? col.render(row, rowIndex)
                    : row[col.field]}
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
          }}
          className="absolute z-50 bg-white border border-gray-300 rounded-md shadow-lg w-44 py-1"
        >
          {contextMenuItems.map((item, idx) => (
            <button
              key={idx}
              className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${
                item.danger ? "text-red-600 font-medium" : "text-gray-800"
              }`}
              onClick={() => {
                item.onClick(contextMenu.row);
                setContextMenu(null);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
