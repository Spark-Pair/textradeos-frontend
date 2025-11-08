import { Outlet } from "react-router-dom";
import Button from "../components/Button";

export default function Layout({ children }) {
  return (
    <div className="h-screen flex flex-col bg-[#eef5f5] overflow-hidden relative">
      {/* 🔹 Main Content */}
      <div className="p-5 h-full overflow-y-auto">{children || <Outlet />}</div>

      {/* 🔹 Floating Bottom Bar */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 flex items-center justify-between space-x-1 bg-[#f8fbfb] shadow-md border border-gray-300 p-1 rounded-2xl">
        <Button
          variant="normal-btn"
          onClick={() => setOpen(true)}
          Icon="Menu"
        />

        {/* 🔹 Separator */}
        <div className="w-px h-5 bg-gray-300" />

        <Button
          variant="normal-btn"
          onClick={() => setOpen(true)}
          Icon="LayoutDashboard"
        />
        <Button
          variant="normal-btn"
          onClick={() => setOpen(true)}
          Icon="Building2"
        />
        <Button
          variant="normal-btn"
          onClick={() => setOpen(true)}
          Icon="Users"
        />

        {/* 🔹 Separator */}
        <div className="w-px h-5 bg-gray-300" />

        <Button
          variant="normal-btn"
          onClick={() => setOpen(true)}
          Icon="Bell"
        />
        <Button
          variant="normal-btn"
          onClick={() => setOpen(true)}
          Icon="User"
        />
      </div>
    </div>
  );
}
