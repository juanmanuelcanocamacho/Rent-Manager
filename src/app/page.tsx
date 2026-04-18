'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, Badge } from '@/components/ui/shared';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Building2,
  Users,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  LayoutDashboard,
  Wallet,
  Check,
  Star,
  Quote,
  Zap,
  Globe,
  Lock,
  BarChart3,
  MousePointer2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Components ---

const NavItem = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link 
    href={href} 
    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group"
  >
    {children}
    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
  </Link>
);

const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  className,
  delay = 0 
}: { 
  icon: any, 
  title: string, 
  description: string, 
  className?: string,
  delay?: number
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className={cn(
      "group relative overflow-hidden rounded-3xl border bg-card/50 p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2",
      className
    )}
  >
    <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
    
    <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
      <Icon size={24} />
    </div>
    
    <h3 className="text-xl font-bold mb-3 tracking-tight">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">
      {description}
    </p>
  </motion.div>
);

const PricingFeature = ({ text }: { text: string }) => (
  <li className="flex items-center gap-3 text-muted-foreground group">
    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
      <Check size={12} className="text-primary" />
    </div>
    <span className="text-sm">{text}</span>
  </li>
);

// --- Sections ---

export default function LandingPage() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30 selection:text-primary-foreground font-sans">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/60 backdrop-blur-xl transition-all duration-300">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform duration-300">
              <Building2 size={24} />
            </div>
            <span className="font-extrabold text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground group-hover:to-primary transition-all duration-300">
              Llavia
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <NavItem href="#features">Características</NavItem>
            <NavItem href="#pricing">Precios</NavItem>
            <NavItem href="#testimonials">Testimonios</NavItem>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            {/* Mobile Button: Hidden on SM and larger */}
            <Link href="/login" className="sm:hidden block ml-1">
              <Button size="sm" className="rounded-full shadow-lg font-bold">
                Entrar
              </Button>
            </Link>
            {/* Desktop/Tablet Buttons: Hidden on mobile */}
            <div className="hidden sm:flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="font-semibold">Log in</Button>
              </Link>
              <Link href="/login">
                <Button className="rounded-full shadow-lg shadow-primary/25 px-6 font-bold hover:scale-105 active:scale-95 transition-all">
                  Empezar Gratis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-6 md:pt-12 pb-20 md:pb-32 overflow-hidden">
          <div className="container mx-auto px-4 max-w-7xl relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-primary/20 text-primary text-xs sm:text-sm font-semibold mb-6 sm:mb-8 shadow-sm"
            >
              <Badge variant="success" className="animate-pulse">Nuevo</Badge>
              <span>Login con @usuario, gestión de encargados y navegación v2.0</span>
              <ArrowRight size={14} />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-[3.25rem] sm:text-6xl md:text-8xl font-black tracking-tighter sm:tracking-tight mb-8 leading-[0.95] sm:leading-[0.9] lg:leading-[0.85] hyphens-auto"
            >
              Gestiona tus rentas <br />
              <span className="text-primary italic relative inline-block max-w-full">
                sin complicaciones
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="4" />
                </svg>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto font-medium leading-relaxed"
            >
              La plataforma definitiva para propietarios que buscan automatizar sus cobros, 
              organizar inquilinos y maximizar su rentabilidad. Todo en un solo lugar.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" className="w-full text-xl px-12 h-16 rounded-full gap-2 shadow-2xl shadow-primary/30 hover:scale-105 transition-all font-bold">
                  Prueba 14 días gratis <Zap size={20} className="fill-current" />
                </Button>
              </Link>
              <div className="flex -space-x-3 items-center">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-background overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?u=${i + 10}`} alt="User" />
                  </div>
                ))}
                <div className="pl-6 text-sm font-semibold text-muted-foreground">
                  +100 propietarios confían en nosotros
                </div>
              </div>
            </motion.div>

            {/* Dashboard Mockup - Refined */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="mt-24 relative max-w-6xl mx-auto group"
            >
              {/* Decorative Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
              
              <div className="relative rounded-[2rem] border bg-card p-3 shadow-2xl overflow-hidden glass">
                <div className="rounded-[1.5rem] overflow-hidden border bg-background/50 backdrop-blur-md">
                  {/* Fake UI simulation */}
                  <div className="h-10 bg-muted/30 border-b flex items-center px-6 gap-2">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/50" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                      <div className="w-3 h-3 rounded-full bg-green-500/50" />
                    </div>
                    <div className="mx-auto text-[10px] text-muted-foreground font-mono bg-muted/50 px-3 py-1 rounded-md">
                      app.llavia.com/dashboard
                    </div>
                  </div>
                  
                  <div className="p-8 text-left grid md:grid-cols-[240px_1fr] gap-8 min-h-[500px]">
                    <div className="hidden md:block space-y-6">
                      <div className="h-4 w-32 bg-primary/20 rounded-full animate-pulse" />
                      <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className={cn("h-10 rounded-xl bg-muted/20 flex items-center px-4 gap-3", i === 1 && "bg-primary/10 border-l-4 border-primary")}>
                            <div className="h-4 w-4 rounded bg-foreground/10" />
                            <div className="h-3 w-20 bg-foreground/10 rounded" />
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-8">
                      <div className="flex justify-between items-end">
                        <div className="space-y-2">
                          <div className="h-8 w-48 bg-foreground/10 rounded-lg" />
                          <div className="h-4 w-32 bg-muted/50 rounded-lg" />
                        </div>
                        <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                          <BarChart3 size={24} />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {[
                          { label: 'Ingresos Mensuales', val: '$12,450', color: 'bg-emerald-500/10 text-emerald-500' },
                          { label: 'Ocupación', val: '98%', color: 'bg-blue-500/10 text-blue-500' },
                          { label: 'Pendientes', val: '2', color: 'bg-rose-500/10 text-rose-500' }
                        ].map((stat, i) => (
                          <div key={i} className="p-6 rounded-3xl border bg-card/50 space-y-3 hover:bg-card transition-colors">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</span>
                            <div className="text-3xl font-black tracking-tight">{stat.val}</div>
                            <div className={cn("inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold", stat.color)}>
                              +12% vs last month
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Fake Chart Area */}
                      <div className="h-48 w-full bg-muted/10 rounded-3xl border relative overflow-hidden p-6 flex items-end gap-2 group-hover:bg-muted/20 transition-colors">
                         {[40, 70, 45, 90, 65, 80, 50, 95, 60, 85].map((h, i) => (
                            <motion.div 
                              key={i}
                              initial={{ height: 0 }}
                              animate={{ height: `${h}%` }}
                              transition={{ duration: 1, delay: 1 + (i * 0.1) }}
                              className="flex-1 bg-gradient-to-t from-primary/40 to-primary/80 rounded-t-lg"
                            />
                         ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Element 1 */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute -top-12 -right-12 hidden lg:flex glass-dark p-6 rounded-3xl border shadow-2xl items-center gap-4 z-20"
              >
                <div className="h-12 w-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <div className="text-white font-bold">Pago Recibido</div>
                  <div className="text-slate-400 text-sm">Contrato #8829 - $1,200</div>
                </div>
              </motion.div>

              {/* Floating Element 2 */}
              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 6, repeat: Infinity }}
                className="absolute -bottom-8 -left-12 hidden lg:flex glass-dark p-6 rounded-3xl border shadow-2xl items-center gap-4 z-20"
              >
                <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center text-white">
                   <Users size={24} />
                </div>
                <div>
                  <div className="text-white font-bold">Nuevo Inquilino</div>
                  <div className="text-slate-400 text-sm">Validado satisfactoriamente</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Logos/Trust */}
        <section className="py-20 bg-muted/20 border-y">
          <div className="container mx-auto px-4 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-12">
              Transformando la gestión inmobiliaria para independientes
            </p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
               {['RENTAL PRO', 'SECURE STAY', 'EASY LEASE', 'URBAN FLOW', 'NEXUS RE'].map(name => (
                 <span key={name} className="text-2xl font-black tracking-tighter">{name}</span>
               ))}
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className="py-32 relative">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-24 space-y-4">
              <h2 className="text-sm font-bold text-primary uppercase tracking-widest">Capacidades</h2>
              <h3 className="text-4xl md:text-6xl font-black tracking-tight">Todo lo que necesitas <br />para dormir tranquilo</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard
                icon={Wallet}
                title="Cobros Automáticos"
                description="Genera facturas, envía recordatorios por WhatsApp y recibe notificaciones de pago al instante."
                className="md:col-span-2 bg-gradient-to-br from-card/50 to-emerald-500/5 border-emerald-500/10"
              />
              <FeatureCard
                icon={ShieldCheck}
                title="Seguridad Total"
                description="Tus datos y los de tus inquilinos protegidos con encriptación bancaria de grado militar."
                className="bg-gradient-to-br from-card/50 to-primary/5 border-primary/10"
              />
              <FeatureCard
                icon={Globe}
                title="Multi-Moneda"
                description="Administra propiedades en cualquier país con soporte para USD, EUR y monedas locales."
                className="bg-gradient-to-br from-card/50 to-blue-500/5 border-blue-500/10"
              />
              <FeatureCard
                icon={LayoutDashboard}
                title="IA Copilot"
                description="Nuestro asistente inteligente analiza tus finanzas y te sugiere mejoras para optimizar rentabilidad."
                className="md:col-span-2 bg-gradient-to-br from-card/50 to-purple-500/5 border-purple-500/10"
              />
              <FeatureCard
                icon={TrendingUp}
                title="Reportes Avanzados"
                description="Gráficos de barras, pasteles y exportaciones a Excel con un solo clic para tu contador."
                delay={0.2}
              />
              <FeatureCard
                icon={Lock}
                title="Roles & Permisos"
                description="Delega en administradores sin exponer tus balances bancarios o datos críticos."
                delay={0.4}
              />
              <FeatureCard
                icon={Building2}
                title="Gestión de Unidades"
                description="Desde una casa hasta edificios enteros con cientos de unidades. Escalabilidad garantizada."
                delay={0.6}
              />
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-32 bg-muted/30">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-20 space-y-6">
              <h2 className="text-4xl md:text-6xl font-black tracking-tight">Precios que crecen contigo</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Sin cargos ocultos. Sin contratos a largo plazo. Cancela cuando quieras.
              </p>
              
              <div className="inline-flex items-center p-1 bg-background rounded-full border shadow-sm">
                <button 
                  onClick={() => setIsAnnual(false)}
                  className={cn("px-6 py-2 rounded-full text-sm font-bold transition-all", !isAnnual ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground")}
                >
                  Mensual
                </button>
                <button 
                  onClick={() => setIsAnnual(true)}
                  className={cn("px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2", isAnnual ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground")}
                >
                  Anual <Badge variant="success" className="h-5">-20%</Badge>
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <motion.div
                whileHover={{ y: -10 }}
                className="relative p-10 rounded-[2.5rem] border bg-card/50 glass hover:shadow-2xl transition-all duration-500 flex flex-col"
              >
                <div className="mb-8">
                  <h4 className="text-2xl font-bold mb-2">Starter</h4>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black">${isAnnual ? '8' : '12'}</span>
                    <span className="text-muted-foreground font-medium">/mes</span>
                  </div>
                  <p className="mt-4 text-muted-foreground">Ideal para gestionar tus primeras propiedades.</p>
                </div>

                <ul className="space-y-4 mb-10 flex-1">
                  <PricingFeature text="Hasta 5 propiedades/unidades" />
                  <PricingFeature text="WhatsApp reminders ilimitados" />
                  <PricingFeature text="Reportes financieros básicos" />
                  <PricingFeature text="Soporte por Email" />
                </ul>

                <Link href="/login">
                  <Button size="lg" variant="outline" className="w-full rounded-2xl h-14 font-bold border-2 hover:bg-primary hover:text-white hover:border-primary transition-all">
                    Elegir Starter
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ y: -10 }}
                className="relative p-10 rounded-[2.5rem] border-2 border-primary bg-primary/[0.03] shadow-2xl flex flex-col overflow-hidden"
              >
                <div className="absolute top-6 right-6">
                  <Badge className="bg-primary text-white border-none px-4 py-1 text-xs uppercase font-black">Popular</Badge>
                </div>
                
                <div className="mb-8">
                  <h4 className="text-2xl font-bold mb-2">Pro Business</h4>
                  <div className="flex items-baseline gap-1 text-primary">
                    <span className="text-5xl font-black">${isAnnual ? '24' : '32'}</span>
                    <span className="opacity-70 font-medium">/mes</span>
                  </div>
                  <p className="mt-4 text-muted-foreground">Potencia para administradores y gran escala.</p>
                </div>

                <ul className="space-y-4 mb-10 flex-1">
                  <PricingFeature text="Unidades Ilimitadas" />
                  <PricingFeature text="Roles de Administrador" />
                  <PricingFeature text="Exportación avanzada a Excel/PDF" />
                  <PricingFeature text="IA Copilot Financial Advisor" />
                  <PricingFeature text="Soporte prioritario 24/7" />
                </ul>

                <Link href="/login">
                  <Button size="lg" className="w-full rounded-2xl h-14 font-bold shadow-xl shadow-primary/25 hover:scale-105 active:scale-95 transition-all">
                    Comenzar Gratis (14 días)
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-32">
          <div className="container mx-auto px-4 max-w-7xl text-center">
             <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-20">Voces de propietarios reales</h2>
             
             <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    name: 'Julian Velez',
                    role: 'Dueño de 15 inmuebles',
                    text: 'Llavia me permitió recuperar el control de mi tiempo. Los recordatorios de pago automáticos hicieron que mi morosidad bajara un 40%.'
                  },
                  {
                    name: 'Claudia Ortiz',
                    role: 'Inversora Real Estate',
                    text: 'La facilidad para exportar todo a Excel me ahorra días de trabajo con mi contador cada mes. Es la herramienta que buscaba hace años.'
                  },
                  {
                    name: 'Roberto Sanchez',
                    role: 'Administrador de Colivings',
                    text: 'Gestionar múltiples inquilinos en habitaciones separadas era un caos hasta que conocí Llavia. Sencillo, potente y siempre evoluciona.'
                  }
                ].map((testimonial, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -5 }}
                    className="p-8 rounded-[2rem] bg-muted/20 border border-muted text-left relative overflow-hidden"
                  >
                    <Quote className="absolute -top-4 -right-4 h-24 w-24 text-primary/5 -rotate-12" />
                    <div className="flex gap-1 mb-6 text-amber-400">
                      {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="currentColor" />)}
                    </div>
                    <p className="text-lg font-medium leading-relaxed mb-8 relative z-10">"{testimonial.text}"</p>
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                        {testimonial.name.slice(0,1)}
                      </div>
                      <div>
                        <h5 className="font-bold">{testimonial.name}</h5>
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
             </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-40 relative overflow-hidden text-center bg-primary text-primary-foreground">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="container mx-auto px-4 relative z-10"
          >
            <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-8">
              Tu tiempo vale más <br />que perseguir recibos
            </h2>
            <p className="text-xl md:text-2xl mb-12 opacity-80 max-w-2xl mx-auto font-medium">
              Únete a la nueva era de la gestión inmobiliaria. Configura tu cuenta en 3 minutos.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/login">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 px-12 h-16 rounded-full text-xl font-bold shadow-2xl transition-all">
                  Empezar Ahora Gratis
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-sm font-bold">
                 <MousePointer2 size={18} /> No requiere tarjeta de crédito
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-20 border-t bg-card text-card-foreground">
        <div className="container mx-auto px-4 max-w-7xl">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20 text-sm">
             <div className="space-y-6">
                <Link href="/" className="flex items-center gap-2 group">
                  <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
                    <Building2 size={18} />
                  </div>
                  <span className="font-black text-xl tracking-tighter">Llavia</span>
                </Link>
                <p className="text-muted-foreground leading-relaxed">
                  Automatizando la rentabilidad para propietarios independientes en toda Latinoamérica y España.
                </p>
             </div>
             <div>
                <h6 className="font-bold text-foreground mb-6 uppercase tracking-widest text-xs">Producto</h6>
                <ul className="space-y-4 text-muted-foreground">
                   <li><Link href="#features" className="hover:text-primary transition-colors">Características</Link></li>
                   <li><Link href="#pricing" className="hover:text-primary transition-colors">Precios</Link></li>
                   <li><Link href="#" className="hover:text-primary transition-colors">Roadmap</Link></li>
                   <li><Link href="#" className="hover:text-primary transition-colors">Seguridad</Link></li>
                </ul>
             </div>
             <div>
                <h6 className="font-bold text-foreground mb-6 uppercase tracking-widest text-xs">Recursos</h6>
                <ul className="space-y-4 text-muted-foreground">
                   <li><Link href="#" className="hover:text-primary transition-colors">Blog Inmobiliario</Link></li>
                   <li><Link href="#" className="hover:text-primary transition-colors">Documentación</Link></li>
                   <li><Link href="#" className="hover:text-primary transition-colors">Centro de Ayuda</Link></li>
                   <li><Link href="#" className="hover:text-primary transition-colors">API para Desarrolladores</Link></li>
                </ul>
             </div>
             <div>
                <h6 className="font-bold text-foreground mb-6 uppercase tracking-widest text-xs">Compañía</h6>
                <ul className="space-y-4 text-muted-foreground">
                   <li><Link href="#" className="hover:text-primary transition-colors">Sobre Nosotros</Link></li>
                   <li><Link href="#" className="hover:text-primary transition-colors">Privacidad</Link></li>
                   <li><Link href="#" className="hover:text-primary transition-colors">Términos</Link></li>
                   <li><Link href="#" className="hover:text-primary transition-colors">Contacto</Link></li>
                </ul>
             </div>
           </div>
           
           <div className="pt-12 border-t flex flex-col md:flex-row justify-between items-center gap-6 text-muted-foreground">
              <p>© {new Date().getFullYear()} Llavia Software S.L. Todos los derechos reservados.</p>
              <div className="flex items-center gap-6">
                <Link href="#" className="hover:text-primary transition-colors">Twitter</Link>
                <Link href="#" className="hover:text-primary transition-colors">LinkedIn</Link>
                <Link href="#" className="hover:text-primary transition-colors">Instagram</Link>
              </div>
           </div>
        </div>
      </footer>
    </div>
  );
}
