import React, { useState, useRef, useEffect } from "react";

function Notifications() {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const panelRef = useRef(null);

  // ✅ Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    }

    if (isNotificationOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotificationOpen]);

  // ✅ Example Notifications Data
  const notifications = [
    {
      id: 1,
      type: "info",
      title: "New update available",
      message: "Version 1.2.3 is ready to install.",
      button: { label: "Update", action: () => alert("Updating...") },
    },
    {
      id: 2,
      type: "success",
      title: "Backup completed",
      message: "Your system backup finished successfully.",
    },
    {
      id: 3,
      type: "warning",
      title: "Low disk space",
      message: "Only 1.5 GB remaining on drive C:",
      button: { label: "Free up space", action: () => alert("Cleaning...") },
    },
    {
      id: 4,
      type: "error",
      title: "Sync failed",
      message: "Could not connect to server. Try again later.",
      button: { label: "Retry", action: () => alert("Retrying...") },
    },
  ];

  // ✅ Variant style helper
  const variantStyles = {
    info: "bg-blue-50 border-blue-300 text-blue-800",
    success: "bg-green-50 border-green-300 text-green-800",
    warning: "bg-yellow-50 border-yellow-300 text-yellow-800",
    error: "bg-red-50 border-red-300 text-red-800",
  };

  return (
    <>
      {/* 🔹 Always-present overlay */}
      <div
        onClick={() => setIsNotificationOpen(false)}
        className={`fixed inset-0 bg-black/30 backdrop-blur-[1px] transition-opacity duration-300 z-40 ${
          isNotificationOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      ></div>

      {/* 🔹 Notification Panel */}
      <div
        ref={panelRef}
        className={`h-screen w-96 p-2 pl-0 fixed top-0 left-full transform transition-transform duration-300 ease-in-out z-50 ${
          isNotificationOpen ? "-translate-x-full" : ""
        }`}
      >
        <div className="w-full h-full bg-[#f8fbfb] drop-shadow-md border border-r-0 border-gray-300 rounded-lg flex flex-col">
          <div className="flex justify-between items-center px-2 py-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Notifications</h2>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setIsNotificationOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 p-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`border rounded-lg p-3 ${variantStyles[n.type]} transition-all duration-300`}
              >
                <div className="font-semibold text-sm">{n.title}</div>
                <div className="text-xs mt-1">{n.message}</div>
                {n.button && (
                  <button
                    onClick={n.button.action}
                    className="mt-2 text-xs font-medium px-3 py-1 bg-white/70 hover:bg-white rounded-md border border-gray-300"
                  >
                    {n.button.label}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 🔹 Toggle Button */}
        <div
          className="button w-4 h-16 bg-[#f8fbfb] drop-shadow-md border border-r-0 border-gray-300 absolute right-full top-40 rounded-l-md flex items-center justify-center cursor-pointer"
          onClick={() => setIsNotificationOpen(!isNotificationOpen)}
        >
          <svg
            width="6"
            height="10"
            viewBox="0 0 5 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`transition-transform duration-300 ${
              isNotificationOpen ? "-scale-x-100" : ""
            }`}
          >
            <path
              d="M0.323625 4.17697L4.29881 0.133206C4.3959 0.0570885 4.45523 0 4.57389 0C4.8274 0 5 0.304472 5 0.732636C5 1.03711 4.89752 1.28449 4.70334 1.44624L1.13269 4.94767V5.0333L4.70334 8.54424C4.89752 8.71551 5 8.96289 5 9.26736C5 9.68601 4.8274 10 4.57389 10C4.44984 10 4.3959 9.94291 4.29881 9.86679L0.323625 5.81351C0.0916936 5.60419 0 5.3568 0 4.99524C0 4.63368 0.0916936 4.3863 0.323625 4.17697Z"
              fill="black"
            />
          </svg>
        </div>
      </div>
    </>
  );
}

export default Notifications;