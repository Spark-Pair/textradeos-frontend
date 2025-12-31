export default function Button({
  children,
  variant = "green-btn",
  className = "",
  Icon,
  title,
  active = false,
  ...props
}) {
  let styles = "";

  switch (variant) {
    case "green-btn":
      styles = "bg-[#127475] text-white hover:bg-[#0c5f60] active:scale-95 px-4 py-2 rounded-xl";
      break;

    case "red-btn":
      styles = "bg-rose-700 text-white hover:bg-rose-800 active:scale-95 px-4 py-2 rounded-xl";
      break;

    case "secondary-btn":
      styles = "bg-gray-600 text-white hover:bg-gray-700 active:scale-95 px-4 py-2 rounded-xl";
      break;

    case "border-btn":
      styles = "bg-[#f8fbfb] hover:bg-[#f0f6f6] text-[#0c5f60] border border-gray-300 p-3 rounded-xl flex items-center gap-2";
      break;

    case "normal-btn":
      styles = `${active ? 'active' : ''} text-[#0c5f60] p-3 rounded-xl flex items-center gap-2`;
      break;

    default:
      styles = "bg-[#127475] hover:bg-[#0c5f60]";
      break;
  }

  return (
    <button
      {...props}
      className={`${className} ${styles}`}
    >
      {children}
    </button>
  );
}
