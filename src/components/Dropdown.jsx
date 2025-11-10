import { Bell } from "lucide-react";
import Button from "./Button";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";

export default function Dropdown({ children, title, icon }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // ✅ Detect outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Cleanup
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <Button onClick={() => setOpen(!open)} variant="normal-btn">
        {icon}
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-14 right-1/2 translate-x-1/2 z-50 bg-[#f8fbfb] shadow-md border border-gray-300 rounded-xl p-1.5 w-52"
          >
            { title && (
              <>
                <div className="header px-2 tracking-wide text-gray-700">
                  { title }
                </div>
                <div className="border-b border-gray-400 mt-2 mb-1 mx-1"></div>
              </>
            ) }
            <div className="text-gray-700">
              { children }
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}