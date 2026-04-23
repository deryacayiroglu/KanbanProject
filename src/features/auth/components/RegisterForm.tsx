"use client";

import { useState } from "react";
import { signup } from "../actions";
import Link from "next/link";

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);
    const result = await signup(formData);
    if (result?.error) {
      setError(result.error);
      setIsPending(false);
    }
  }

  return (
    <div className="w-full max-w-sm space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Create an account
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Enter your details to get started
        </p>
      </div>
      
      <form action={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">
            {error}
          </div>
        )}
        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium text-gray-700">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            placeholder="John Doe"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            placeholder="name@example.com"
          />
        </div>
        
        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            placeholder="••••••••"
          />
        </div>

        <button 
          type="submit" 
          disabled={isPending}
          className="w-full bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900/20 disabled:opacity-50"
        >
          {isPending ? "Creating account..." : "Sign Up"}
        </button>
      </form>
      
      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
