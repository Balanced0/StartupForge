"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import DashboardGuard from "@/components/dashboard/DashboardGuard";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <DashboardGuard>
      <div className="flex min-h-screen">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-1 flex-col">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
          <div className="flex-1 p-6">{children}</div>
        </div>
      </div>
    </DashboardGuard>
  );
}
