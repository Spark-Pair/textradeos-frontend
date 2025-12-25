const IconWrapper = ({ children, color, bgColor }) => (
  <div
    className={`p-3.5 rounded-lg ${bgColor} ${color} flex items-center justify-center`}
  >
    {children}
  </div>
);

export default function StatTile({ label, value, icon: Icon, color, bgColor }) {
  return (
    <div className="bg-white p-2.5 rounded-2xl shadow-sm flex items-center space-x-4 border border-gray-300">
      <IconWrapper color={color} bgColor={bgColor}>
        {/* Lucide icons are used here */}
        <Icon size={26} />
      </IconWrapper>
      <div className="space-y-6 pb-1.5">
        <p className="text-sm text-gray-600 leading-0">{label}</p>
        <p className="text-[1.45rem] font-semibold text-gray-800 leading-0">{value}</p>
      </div>
    </div>
  );
};