import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  useEffect(() => {
    document.title = "Dashboard | TexTradeOS";
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">👨‍💻 Developer Dashboard</h1>
      <div className="bg-white shadow-md rounded-lg p-6 space-y-6">
        <p className="text-gray-700 mb-4">
          Welcome, <strong>{user?.name}</strong>
        </p>
      </div>
    </div>
  );
}
