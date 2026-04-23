"use client";

import { logout } from "@/features/auth/actions";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <button
      onClick={() => logout()}
      className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
      title="Sign out"
    >
      <LogOut size={18} />
    </button>
  );
}
