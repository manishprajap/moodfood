"use client";

import type { FormEvent } from "react";

interface LoginScreenProps {
  email: string;
  password: string;
  loading: boolean;
  error: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
}

export function LoginScreen({
  email,
  password,
  loading,
  error,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: LoginScreenProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f5ef] px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#28271f] text-xl font-bold text-white">
            M
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-[#28271f]">
            MoodFood Admin
          </h1>

          <p className="mt-2 text-sm text-[#747166]">
            Sign in to manage your restaurant
          </p>
        </div>

        <div className="rounded-2xl border border-[#e8e5dc] bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold text-[#28271f]">
            Admin Login
          </h2>

          <p className="mt-1 text-sm text-[#747166]">
            Enter your credentials to continue.
          </p>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="admin-email"
                className="mb-2 block text-sm font-medium text-[#28271f]"
              >
                Email address
              </label>

              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => onEmailChange(event.target.value)}
                placeholder="admin@example.com"
                disabled={loading}
                className="w-full rounded-xl border border-[#dedbd2] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#28271f] focus:ring-2 focus:ring-[#28271f]/10 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="mb-2 block text-sm font-medium text-[#28271f]"
              >
                Password
              </label>

              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => onPasswordChange(event.target.value)}
                placeholder="Enter your password"
                disabled={loading}
                className="w-full rounded-xl border border-[#dedbd2] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#28271f] focus:ring-2 focus:ring-[#28271f]/10 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl bg-[#28271f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#3b392f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-[#99958a]">
          Secure administrator access
        </p>
      </div>
    </main>
  );
}