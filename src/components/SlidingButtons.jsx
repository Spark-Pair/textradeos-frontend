import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

export default function SlidingButtons({ children }) {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Get all buttons inside container
    const buttons = Array.from(container.querySelectorAll("button"));
    const newPositions = buttons.map((btn) => {
      const rect = btn.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      return {
        left: rect.left - containerRect.left,
        top: rect.top - containerRect.top,
        width: rect.width,
        height: rect.height,
      };
    });
    setPositions(newPositions);

    // Find which button has "active" class
    const index = buttons.findIndex((btn) => btn.classList.contains("active"));
    setActiveIndex(index !== -1 ? index : null);
  }, [children]);

  return (
    <div ref={containerRef} className="relative flex gap-2">
      {/* Active Slider Background */}
      {activeIndex !== null && positions[activeIndex] && (
        <motion.div
          className="absolute bg-[#127475]/15 rounded-xl"
          initial={false} // ✅ prevents initial 0-size animation
          animate={{
            left: positions[activeIndex].left,
            top: positions[activeIndex].top,
            width: positions[activeIndex].width,
            height: positions[activeIndex].height,
          }}
          transition={{
            type: "spring",
            stiffness: 1200, // higher = faster response
            damping: 30,     // lower = more responsive, higher = more rigid
            mass: 0.2,       // smaller mass = quicker
          }}
        />
      )}

      {/* Buttons */}
      {children}
    </div>
  );
}
