import { LoginForm } from "@/features/auth/components/LoginForm";
import { ToastNotification } from "@/components/ui/ToastNotification";

export default function LoginPage({ searchParams }: { searchParams: { logout?: string } }) {
  const showLogoutToast = searchParams.logout === "success";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <LoginForm />
      {showLogoutToast && <ToastNotification message="You have been logged out" />}
    </div>
  );
}
