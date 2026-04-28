import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-24 text-center">
      <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 tracking-tight text-gray-900">
        Welcome to TaskFlow
      </h1>
      <p className="text-base sm:text-lg md:text-xl text-gray-500 mb-8 max-w-2xl">
        A modern Kanban workspace to organize projects, tasks, and workflows efficiently.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto max-w-xs sm:max-w-none mx-auto">
        <Link href="/login" className="w-full sm:w-auto">
          <Button variant="primary" size="lg" className="w-full sm:w-auto min-w-[140px] whitespace-nowrap">
            Log In
          </Button>
        </Link>
        <Link href="/register" className="w-full sm:w-auto">
          <Button variant="outline" size="lg" className="w-full sm:w-auto min-w-[140px] whitespace-nowrap bg-white">
            Sign Up
          </Button>
        </Link>
      </div>
    </main>
  );
}
