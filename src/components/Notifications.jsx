import React, { useState, useRef, useEffect } from "react";

function Notifications() {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const panelRef = useRef(null);

  // ✅ Close panel when clicking outside
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

  return (
    <div
      ref={panelRef}
      className={`h-screen w-72 p-2 pl-0 fixed top-0 left-full transform transition-transform duration-300 ease-in-out ${
        isNotificationOpen ? "-translate-x-full" : ""
      }`}
    >
      {/* 🔹 Notification Panel */}
      <div className="notifications w-full h-full bg-[#f8fbfb] drop-shadow-md border border-r-0 border-gray-300 rounded-lg"></div>

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
  );
}

export default Notifications;
