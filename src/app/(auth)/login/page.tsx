"use client";

import { useActionState, useState } from "react";
import { authAction } from "@/actions/auth";
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Building2, 
  Lock, 
  User, 
  CheckCircle2, 
  KeyRound, 
  LayoutDashboard, 
  Zap, 
  ShieldCheck, 
  Wallet,
  TrendingUp 
} from 'lucide-react';
import { Button } from "@/components/ui/shared";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [state, formAction, isPending] = useActionState(authAction, undefined);

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 overflow-hidden bg-background">
      {/* --- Left Side: Branding & Value Props --- */}
      <div className="hidden lg:flex flex-col justify-between p-16 bg-slate-950 text-white relative overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] animate-pulse delay-700" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 group">
             <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform duration-300">
              <Building2 size={24} />
            </div>
            <span className="font-extrabold text-2xl tracking-tighter text-white">Llavia</span>
          </Link>
        </div>

        <div className="relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.5 }}
              className="max-w-lg"
            >
              <h2 className="text-5xl font-black tracking-tight mb-8 leading-[1.1]">
                {mode === 'login'
                  ? "Toda tu cartera, \nen un solo lugar."
                  : "Empieza a gestionar \ncon inteligencia hoy."}
              </h2>
              <p className="text-slate-400 text-lg mb-10 leading-relaxed font-medium">
                {mode === 'login'
                  ? "Accede a tu panel centralizado para gestionar inquilinos, contratos y finanzas con total claridad."
                  : "Regístrate ahora y únete a los propietarios que están modernizando el sector inmobiliario."}
              </p>
              
              <div className="space-y-6">
                {[
                  { icon: Wallet, text: "Control de rentabilidad en tiempo real", color: "text-emerald-400", bg: "bg-emerald-400/10" },
                  { icon: LayoutDashboard, text: "Dashboard intuitivo sin curva de aprendizaje", color: "text-blue-400", bg: "bg-blue-400/10" },
                  { icon: ShieldCheck, text: "Seguridad y automatización certificada", color: "text-purple-400", bg: "bg-purple-400/10" }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + (i * 0.1) }}
                    className="flex items-center gap-4"
                  >
                    <div className={cn("p-3 rounded-2xl", item.bg)}>
                      <item.icon className={item.color} size={22} />
                    </div>
                    <span className="font-semibold text-slate-200 text-lg">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Minimal Illustration / Dashboard Preview Thumbnail */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="relative z-10 glass-dark p-1 rounded-[2rem] border border-white/10 shadow-2xl scale-90 translate-x-20 rotate-3 opacity-90 hover:rotate-0 hover:scale-95 transition-all duration-700 cursor-default"
        >
          <div className="h-48 w-full bg-slate-900/40 rounded-[1.5rem] overflow-hidden p-8 flex flex-col justify-between">
            <div className="flex justify-between items-start">
               <div className="space-y-1">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Balance Mensual</p>
                  <h4 className="text-2xl font-black text-white">Bs 12,450.00</h4>
               </div>
               <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <TrendingUp size={14} className="text-emerald-400" />
               </div>
            </div>
            
            <div className="h-16 w-full flex items-end gap-1 px-1">
               {[30, 45, 35, 60, 55, 80, 75, 90, 85, 100].map((h, i) => (
                  <motion.div 
                     key={i}
                     initial={{ height: 0 }}
                     animate={{ height: `${h}%` }}
                     transition={{ duration: 1, delay: i * 0.05 }}
                     className="flex-1 bg-gradient-to-t from-primary/5 to-primary/40 rounded-t-sm"
                  />
               ))}
            </div>
          </div>
        </motion.div>

        <div className="relative z-10 flex justify-between items-center text-sm text-slate-500 font-medium">
          <span>© {new Date().getFullYear()} Llavia Software.</span>
          <div className="flex gap-4">
             <Link href="#" className="hover:text-white transition-colors">Privacidad</Link>
             <Link href="#" className="hover:text-white transition-colors">Ayuda</Link>
          </div>
        </div>
      </div>

      {/* --- Right Side: Form --- */}
      <div className="flex flex-col items-center justify-center p-8 md:p-16 relative bg-background">
        {/* Mobile Logo */}
        <Link href="/" className="lg:hidden flex items-center gap-2 mb-12 animate-in fade-in zoom-in duration-500">
           <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground">
            <Building2 size={24} />
          </div>
          <span className="font-extrabold text-2xl tracking-tighter">Llavia</span>
        </Link>

        {/* Back navigation */}
        <Link href="/" className="absolute top-10 left-10 lg:flex hidden items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-all group">
          <div className="h-8 w-8 rounded-full border flex items-center justify-center group-hover:border-primary transition-colors">
            <ArrowLeft size={16} /> 
          </div>
          Volver
        </Link>

        <div className="w-full max-w-md space-y-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-4xl font-black tracking-tight mb-2">
                {mode === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
              </h1>
              <p className="text-muted-foreground font-medium">
                {mode === 'login'
                  ? 'Gestiona tus rentas con total facilidad.'
                  : 'Empieza gratis y escala a tu ritmo.'}
              </p>
            </motion.div>
          </AnimatePresence>

          <form action={formAction} className="space-y-6">
            <input type="hidden" name="mode" value={mode} />

            <AnimatePresence mode="popLayout">
              {state?.error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: 'auto', scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold flex items-center gap-3 overflow-hidden"
                >
                  <div className="h-8 w-8 rounded-full bg-destructive/20 flex items-center justify-center shrink-0">
                    <Zap size={14} className="fill-current" />
                  </div>
                  {state.error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">
                Email o Usuario
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  name="email"
                  type="text"
                  placeholder="ejemplo@correo.com o usuario"
                  required
                  className="flex h-12 w-full rounded-2xl border-2 border-input bg-background/50 pl-12 pr-4 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                  Contraseña
                </label>
                {mode === 'login' && (
                  <Link href="#" className="text-xs font-bold text-primary hover:underline">
                    ¿Olvidaste tu contraseña?
                  </Link>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  min={8}
                  className="flex h-12 w-full rounded-2xl border-2 border-input bg-background/50 pl-12 pr-4 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <AnimatePresence>
              {mode === 'register' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-6 overflow-hidden"
                >
                  <div className="space-y-2 pt-2">
                    <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      País de Operación
                    </label>
                    <select
                      name="country"
                      required
                      className="flex h-12 w-full rounded-2xl border-2 border-input bg-background/50 px-4 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all group"
                    >
                      <option value="BOLIVIA">🇧🇴 Bolivia (Pesos Bolivianos)</option>
                      <option value="SPAIN">🇪🇸 España (Euros)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">
                      Código de Registro
                    </label>
                    <div className="relative group">
                      <KeyRound className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <input
                        name="code"
                        type="text"
                        placeholder="Ingresa tu código"
                        required
                        className="flex h-12 w-full rounded-2xl border-2 border-input bg-background/50 pl-12 pr-4 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all disabled:opacity-50"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground font-bold italic ml-1">* El código debe ser proporcionado por el administrador del sistema.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-14 rounded-2xl text-lg font-black shadow-xl shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all group"
            >
              {isPending ? (
                <span className="flex items-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-3 border-white/30 border-t-white" />
                  Procesando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {mode === 'login' ? "Entrar ahora" : "Crear mi cuenta"} <ArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform" size={20} />
                </span>
              )}
            </Button>
          </form>

          <motion.div 
            layout
            className="pt-6 text-center"
          >
             <p className="text-sm font-medium text-muted-foreground">
              {mode === 'login' ? (
                <>
                  ¿Aún no tienes cuenta?{" "}
                  <button
                    onClick={toggleMode}
                    className="text-primary font-black hover:underline underline-offset-4 decoration-2"
                  >
                    Regístrate aquí
                  </button>
                </>
              ) : (
                <>
                  ¿Ya eres parte de Llavia?{" "}
                  <button
                    onClick={toggleMode}
                    className="text-primary font-black hover:underline underline-offset-4 decoration-2"
                  >
                    Inicia sesión
                  </button>
                </>
              )}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
