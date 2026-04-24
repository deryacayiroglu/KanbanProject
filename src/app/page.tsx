import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 text-center">
      <h1 className="text-5xl font-bold mb-6">Welcome to TaskFlow</h1>
      <p className="text-xl text-gray-800 dark:text-gray-300 mb-8 max-w-2xl animate-vibrate">
        A modern Kanban workspace to organize projects, tasks, and workflows efficiently.
      </p>

      <div className="flex gap-4">
        <Link href="/login">
          <Button variant="primary" size="lg">Log In</Button>
        </Link>
        <Link href="/register">
          <Button variant="outline" size="lg">Sign Up</Button>
        </Link>
      </div>
    </main>
  );
}
