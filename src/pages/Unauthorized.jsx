// src/pages/Unauthorized.jsx
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#eef5f5] text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Access Denied 🚫
      </h1>
      <p className="text-gray-600 mb-6">
        You don't have permission to access this page.
      </p>
      <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
    </div>
  );
}
