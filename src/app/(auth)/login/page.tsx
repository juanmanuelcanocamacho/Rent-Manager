"use client";

import { useActionState, useState } from "react";
import { authAction } from "@/actions/auth";
import Link from 'next/link';
import { ArrowLeft, Building2, Lock, User, CheckCircle2, KeyRound } from 'lucide-react';
import { Button } from "@/components/ui/shared";

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [state, formAction, isPending] = useActionState(authAction, undefined);

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: Branding & Visuals */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-slate-900 text-white relative overflow-hidden">
        {/* Background Splashes */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl text-white hover:opacity-80 transition-opacity">
            <Building2 className="text-primary" />
            <span>Gestión Alquiler</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="text-4xl font-extrabold tracking-tight mb-6">
            {mode === 'login'
              ? "Gestiona tus propiedades con inteligencia."
              : "Comienza a gestionar tu patrimonio hoy."}
          </h2>
          <p className="text-slate-300 text-lg mb-8 leading-relaxed">
            {mode === 'login'
              ? "Únete a la plataforma que centraliza inquilinos, contratos y finanzas. Todo lo que necesitas para escalar tu patrimonio sin perder el control."
              : "Regístrate como propietario y accede a las herramientas más potentes del mercado para la gestión de alquileres."}
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <CheckCircle2 className="text-emerald-400" size={20} />
              </div>
              <span className="font-medium text-slate-200">Control financiero en tiempo real</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <CheckCircle2 className="text-blue-400" size={20} />
              </div>
              <span className="font-medium text-slate-200">Gestión de incidencias y mantenimiento</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <CheckCircle2 className="text-purple-400" size={20} />
              </div>
              <span className="font-medium text-slate-200">Automatización de recibos</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-slate-500">
          © {new Date().getFullYear()} Gestión Alquiler. Todos los derechos reservados.
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex flex-col items-center justify-center p-6 md:p-12 bg-background relative">
        <Link href="/" className="absolute top-6 left-6 lg:hidden flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
          <ArrowLeft size={20} />
        </Link>
        <Link href="/" className="absolute top-6 right-6 lg:top-12 lg:right-12 hidden lg:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft size={16} /> Volver al Inicio
        </Link>

        <div className="w-full max-w-sm space-y-8">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight">
              {mode === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {mode === 'login'
                ? 'Introduce tus credenciales para acceder al panel.'
                : 'Completa los datos para registrarte como propietario.'}
            </p>
          </div>

          <form action={formAction} className="space-y-5">
            <input type="hidden" name="mode" value={mode} />

            {state?.error && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
                {state.error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  name="email"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background pl-10 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  min={8}
                  className="flex h-10 w-full rounded-md border border-input bg-background pl-10 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-sm font-medium leading-none">
                  País
                </label>
                <select
                  name="country"
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                >
                  <option value="BOLIVIA">🇧🇴 Bolivia (Bs)</option>
                  <option value="SPAIN">🇪🇸 España (€)</option>
                </select>
              </div>
            )}

            {mode === 'register' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-sm font-medium leading-none">
                  Código de Registro
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    name="code"
                    type="text"
                    placeholder="Código secreto"
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background pl-10 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground italic">Pide el código al administrador del sistema.</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full shadow-lg shadow-primary/20"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {mode === 'login' ? 'Iniciando sesión...' : 'Registrando...'}
                </span>
              ) : (
                mode === 'login' ? "Iniciar Sesión" : "Crear Cuenta"
              )}
            </button>
          </form>

          <p className="px-8 text-center text-sm text-muted-foreground">
            {mode === 'login' ? (
              <>
                ¿No tienes cuenta?{" "}
                <button
                  onClick={toggleMode}
                  className="underline underline-offset-4 hover:text-primary font-medium"
                >
                  Regístrate aquí
                </button>
              </>
            ) : (
              <>
                ¿Ya tienes una cuenta?{" "}
                <button
                  onClick={toggleMode}
                  className="underline underline-offset-4 hover:text-primary font-medium"
                >
                  Inicia sesión
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
