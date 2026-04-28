import { LoginForm } from "@/features/auth/components/LoginForm";
import { ToastNotification } from "@/components/ui/ToastNotification";

export default function LoginPage({ searchParams }: { searchParams: { logout?: string; confirmed?: string; error?: string } }) {
  const showLogoutToast = searchParams.logout === "success";
  const showConfirmedToast = searchParams.confirmed === "true";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <LoginForm />
      {showLogoutToast && <ToastNotification message="You have been logged out" />}
      {showConfirmedToast && <ToastNotification message="Email confirmed! Please sign in." />}
    </div>
  );
}
