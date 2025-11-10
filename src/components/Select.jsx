import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Select({
  options = [],
  value = null,
  onChange = () => {},
  placeholder = "Select...",
  searchable = true,
  clearable = true,
  label = null,
}) {

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);

  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const selected = options.find((o) => o.value === value) || null;

  // filtered options
  const filtered = query
    ? options.filter((o) =>
        o.label.toLowerCase().includes(query.toLowerCase())
      )
    : options;

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  // close on outside click
  useEffect(() => {
    function onDoc(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // keyboard navigation
  useEffect(() => {
    function onKey(e) {
      if (!open) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
        scrollIntoView(highlighted + 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlighted((h) => Math.max(h - 1, 0));
        scrollIntoView(highlighted - 1);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const opt = filtered[highlighted];
        if (opt) selectOption(opt);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, filtered, highlighted]);

  function scrollIntoView(index) {
    const list = listRef.current;
    if (!list) return;
    const el = list.children[index];
    if (!el) return;
    const elTop = el.offsetTop;
    const elBottom = elTop + el.offsetHeight;
    if (elTop < list.scrollTop) list.scrollTop = elTop;
    else if (elBottom > list.scrollTop + list.clientHeight)
      list.scrollTop = elBottom - list.clientHeight;
  }

  function selectOption(opt) {
    onChange(opt.value);
    setOpen(false);
  }

  function clearSelection(e) {
    e.stopPropagation();
    onChange(null);
    setQuery("");
    setOpen(false);
  }

  return (
    <div className="relative inline-block w-full" ref={rootRef}>
      {label && <label className="block mb-1 text-gray-800">{label}</label>}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => !v);
          setTimeout(() => inputRef.current && inputRef.current.focus(), 30);
        }}
        className={`w-full flex items-center justify-between rounded-xl bg-[#f8fbfb] border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#127475] ps-4 p-2.5`}
      >
        <div className="flex-1 text-left truncate">
          {selected ? selected.label : <span className="text-gray-400">{placeholder}</span>}
        </div>

        <div className="flex items-center gap-2">
          {clearable && selected && (
            <button
              onClick={clearSelection}
              aria-label="Clear selection"
              className="p-1 rounded hover:bg-gray-100"
            >
              <X size={14} />
            </button>
          )}

          <ChevronDown size={18} className={`transition-transform ${open ? "-rotate-180" : "rotate-0"}`} />
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.12 }}
            className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg"
          >
            <div className="p-2">
              {searchable && (
                <div className="flex items-center gap-2 px-2 py-1 border border-gray-100 rounded-md">
                  <Search size={16} />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setHighlighted(0);
                    }}
                    placeholder="Search..."
                    className="w-full bg-transparent outline-none text-sm"
                  />
                </div>
              )}

              <div
                ref={listRef}
                role="listbox"
                aria-activedescendant={filtered[highlighted] ? `opt-${filtered[highlighted].value}` : undefined}
                tabIndex={-1}
                className="max-h-48 overflow-auto mt-2 space-y-1"
              >
                {filtered.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">No results</div>
                ) : (
                  filtered.map((opt, i) => {
                    const isSelected = selected && selected.value === opt.value;
                    const isHighlighted = i === highlighted;
                    return (
                      <div
                        id={`opt-${opt.value}`}
                        key={opt.value}
                        role="option"
                        aria-selected={isSelected}
                        onMouseEnter={() => setHighlighted(i)}
                        onClick={() => selectOption(opt)}
                        className={`flex items-center justify-between cursor-pointer px-3 py-2 rounded-md ${isHighlighted ? "bg-[#127475]/10" : "hover:bg-gray-100"} ${isSelected ? "font-semibold" : ""}`}
                      >
                        <div className="truncate">{opt.label}</div>
                        {opt.meta && <div className="ml-2 text-xs text-gray-400">{opt.meta}</div>}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
