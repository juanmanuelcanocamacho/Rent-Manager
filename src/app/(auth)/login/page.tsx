"use client";

import { useActionState } from "react";
import { login } from "@/actions/auth";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="glass p-8 rounded-2xl shadow-2xl w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600 dark:from-indigo-400 dark:to-pink-400">
            Gravity Rent
          </h1>
          <p className="text-muted-foreground mt-2">Bienvenido de nuevo</p>
        </div>

        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 text-sm font-medium text-center">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Usuario</label>
            <input
              name="email"
              type="text"
              placeholder="admin"
              required
              className="w-full px-4 py-2 rounded-lg border bg-background/50 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Contraseña</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="w-full px-4 py-2 rounded-lg border bg-background/50 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 px-4 bg-primary text-primary-foreground font-bold rounded-lg shadow-lg hover:shadow-primary/50 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Iniciando..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}
