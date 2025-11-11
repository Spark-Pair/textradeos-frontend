import { useRef } from "react";

export default function Input({
  label,
  type,
  className = "",
  value,
  onChange,
  allowDecimal = false,
  required = true,
  ...props
}) {
  const inputRef = useRef(null);

  const handleFocus = () => {
    if (type === "date" && inputRef.current?.showPicker) {
      inputRef.current.showPicker();
    }
  };

  const handleAmountChange = (e) => {
    let inputValue = e.target.value;

    // Allow digits, and optionally a dot if allowDecimal is true
    const regex = allowDecimal ? /[^0-9.]/g : /[^0-9]/g;
    inputValue = inputValue.replace(regex, "");

    // Prevent multiple dots if decimals allowed
    if (allowDecimal) {
      const parts = inputValue.split(".");
      if (parts.length > 2) {
        inputValue = parts[0] + "." + parts.slice(1).join("");
      }

      // Limit decimal part to 2 digits
      if (parts[1]?.length > 2) {
        inputValue = parts[0] + "." + parts[1].slice(0, 2);
      }
    }

    // Format with commas (before decimal)
    const [integer, decimal] = inputValue.split(".");
    const formatted =
      integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
      (allowDecimal && decimal ? "." + decimal : "");

    // Pass raw numeric string (without commas) to parent
    onChange({
      target: {
        name: e.target.name,
        value: inputValue,
      },
    });

    // Show formatted text in the field
    inputRef.current.value = formatted;
  };

  const handleChange = (e) => {
    if (type === "amount") {
      handleAmountChange(e);
    } else {
      onChange(e);
    }
  };

  const displayValue =
    type === "amount" && value
      ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      : value || "";

  return (
    <div>
      {label && <label className="block mb-1 text-gray-800">{label} {required || '(Optional)'}</label>}
      <input
        {...props}
        ref={inputRef}
        type={type === "amount" ? "text" : type}
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        inputMode={type === "amount" ? (allowDecimal ? "decimal" : "numeric") : undefined}
        className={`w-full bg-[#f8fbfb] border border-gray-300 rounded-xl ps-4 p-2.5 focus:outline-none focus:ring-2 focus:ring-[#127475] text-gray-700 ${className}`}
      />
    </div>
  );
}
