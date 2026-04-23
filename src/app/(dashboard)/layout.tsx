import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/features/auth/components/LogoutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 h-14 flex items-center px-6 justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link href="/boards" className="font-semibold tracking-tight text-gray-900">
            TaskFlow
          </Link>
          <nav className="hidden sm:flex items-center gap-4">
            <Link href="/boards" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Boards
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600 border border-gray-200">
            {user.user_metadata?.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
