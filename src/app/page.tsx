'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { Button, Card } from '@/components/ui/shared';
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
  Quote
} from 'lucide-react';

export default function LandingPage() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary/20">
      {/* Navigation */}
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
          <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            <Building2 className="text-primary h-7 w-7" />
            <span>Llavia</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">Características</Link>
            <Link href="#pricing" className="hover:text-foreground transition-colors">Precios</Link>
            <Link href="#testimonials" className="hover:text-foreground transition-colors">Testimonios</Link>
          </nav>

          <div className="flex gap-4 items-center">
            <ThemeToggle />
            <div className="hidden sm:block">
              <Link href="/login">
                <Button variant="ghost" className="font-medium">Iniciar Sesión</Button>
              </Link>
            </div>
            <Link href="/login">
              <Button className="font-semibold shadow-lg shadow-primary/20 rounded-full px-6">Empezar Gratis</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-primary/10 via-background to-background -z-10 blur-3xl rounded-full opacity-50 dark:opacity-20" />

          <div className="container mx-auto px-4 max-w-5xl text-center relative z-10">
            <div
              className="animate-in fade-in slide-in-from-bottom-4 duration-700 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Nuevo: Importación masiva desde Excel disponible
            </div>

            <h1
              className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 fill-mode-both text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-foreground leading-[1.1]"
            >
              Gestiona tus alquileres <br className="hidden md:block" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                sin dolores de cabeza
              </span>
            </h1>

            <p
              className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto font-light leading-relaxed"
            >
              Abandona las hojas de cálculo. Centraliza inquilinos, contratos, recibos y rentabilidad en un software intuitivo diseñado para propietarios modernos.
            </p>

            <div
              className="animate-in fade-in slide-in-from-bottom-10 duration-700 delay-500 fill-mode-both flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" className="w-full text-lg px-8 h-14 rounded-full gap-2 shadow-xl shadow-primary/25 hover:scale-105 transition-transform">
                  Prueba Gratuita de 14 días <ArrowRight size={18} />
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground mt-2 sm:mt-0 sm:ml-4">
                No requiere tarjeta de crédito
              </p>
            </div>

            {/* Mockup Image/Dashboard Preview */}
            <div
              className="animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-700 fill-mode-both mt-20 relative mx-auto max-w-5xl"
            >
              <div className="rounded-2xl border bg-background/50 backdrop-blur-sm p-2 shadow-2xl shadow-primary/10">
                <div className="rounded-xl overflow-hidden border bg-card">
                  {/* Fake Dashboard Header */}
                  <div className="h-12 border-b bg-muted/50 flex items-center px-4 gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                  </div>
                  {/* Llavia Real Dashboard UI Simulation */}
                  <div className="flex flex-col sm:flex-row h-full max-h-[500px] overflow-hidden opacity-95 text-left bg-slate-50 dark:bg-slate-900 rounded-b-xl border-t-0">
                    {/* Sidebar Mockup */}
                    <div className="w-56 border-r bg-white dark:bg-slate-950 flex-col hidden sm:flex shrink-0">
                      <div className="h-16 flex items-center px-6">
                        <div className="font-bold text-xl text-primary flex items-center gap-2">
                          Llavia
                        </div>
                      </div>
                      <div className="flex-1 px-3 py-4 space-y-1">
                        <div className="bg-muted/50 text-foreground font-medium rounded-md px-3 py-2 text-sm flex items-center gap-2">
                          <LayoutDashboard className="h-4 w-4" /> Dashboard
                        </div>
                        <div className="text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm flex items-center gap-2">
                          <Building2 className="h-4 w-4" /> Propiedades
                        </div>
                        <div className="text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm flex items-center gap-2">
                          <Users className="h-4 w-4" /> Inquilinos
                        </div>
                        <div className="text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm flex items-center gap-2">
                          <Wallet className="h-4 w-4" /> Facturación
                        </div>
                      </div>
                    </div>

                    {/* Main Content Mockup */}
                    <div className="flex-1 flex flex-col pt-4 px-6 pb-6 overflow-hidden bg-slate-50/50 dark:bg-background">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h2 className="text-2xl font-bold tracking-tight text-primary">Dashboard</h2>
                          <p className="text-sm text-muted-foreground">Resumen integral de finanzas y propiedades.</p>
                        </div>
                      </div>

                      {/* Llavia Copilot Banner */}
                      <div className="rounded-xl border border-purple-100 bg-purple-50 dark:bg-purple-900/10 dark:border-purple-900/30 p-4 mb-6 shadow-sm">
                        <div className="flex gap-4">
                          <div className="h-10 w-10 shrink-0 rounded-lg bg-primary text-white flex items-center justify-center">
                            <Star className="h-5 w-5 fill-current" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-primary mb-1">Llavia Copilot</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed hidden md:block">
                              Actualmente, varios inquilinos presentan deudas por un total de 2,600.00 BOB, correspondientes al mes de febrero. Te sugiero que revises la pestaña de facturación para tomar acción. ¡Sigamos avanzando juntos!
                            </p>
                            <div className="mt-2 text-sm font-medium text-primary flex items-center gap-1">
                              Ir a Gestión de Facturas <ArrowRight className="h-3 w-3" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 4 Stat Cards Grid */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Margen */}
                        <div className="rounded-xl border bg-white dark:bg-slate-950 p-4 shadow-sm relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                              <div className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <TrendingUp className="h-3 w-3 text-emerald-600" />
                              </div>
                              <span className="hidden xl:inline">Margen (Mes)</span>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">100% MoM</span>
                          </div>
                          <div className="text-xl font-bold mt-2 truncate">Bs 900,00</div>
                          <p className="text-[10px] text-muted-foreground mt-1 truncate">Ganancia Neta Calculada</p>
                        </div>

                        {/* Deuda Vencida */}
                        <div className="rounded-xl border bg-white dark:bg-slate-950 p-4 shadow-sm relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-rose-600">
                              <div className="h-5 w-5 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                                <CheckCircle2 className="h-3 w-3 text-rose-600" />
                              </div>
                              <span className="hidden xl:inline">Deuda Vencida</span>
                            </div>
                          </div>
                          <div className="text-xl font-bold mt-2 truncate">Bs 2.600,00</div>
                          <p className="text-[10px] text-rose-500 mt-1 truncate">4 facturas en espera</p>
                        </div>

                        {/* Próx 7 dias */}
                        <div className="rounded-xl border bg-white dark:bg-slate-950 p-4 shadow-sm relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-blue-600">
                              <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Wallet className="h-3 w-3 text-blue-600" />
                              </div>
                              <span className="hidden xl:inline">Próx. 7 Días</span>
                            </div>
                          </div>
                          <div className="text-xl font-bold mt-2 truncate">Bs 0,00</div>
                          <p className="text-[10px] text-muted-foreground mt-1 truncate">Proyección de 0 cobros</p>
                        </div>

                        {/* Ocupación */}
                        <div className="rounded-xl border bg-white dark:bg-slate-950 p-4 shadow-sm relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-600">
                              <div className="h-5 w-5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                <Building2 className="h-3 w-3 text-indigo-600" />
                              </div>
                              <span className="hidden xl:inline">Ocupación</span>
                            </div>
                          </div>
                          <div className="text-xl font-bold mt-2 flex items-baseline gap-1 truncate">
                            100% <span className="text-[10px] text-muted-foreground font-normal hidden xl:inline">(6/6) prop.</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5 mt-2 hidden sm:block">
                            <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof / Trusted By */}
        <section className="py-10 border-y bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm font-medium text-muted-foreground mb-6 uppercase tracking-wider">
              Diseñado para propietarios y administradores independientes
            </p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale">
              {/* Placeholder logos */}
              <div className="flex items-center gap-2 font-bold text-xl"><Building2 /> Inmobiliaria Sur</div>
              <div className="flex items-center gap-2 font-bold text-xl"><ShieldCheck /> Gestión Segura</div>
              <div className="flex items-center gap-2 font-bold text-xl"><LayoutDashboard /> RentAdmin Pro</div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-background">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Todo lo que necesitas, en un solo lugar</h2>
              <p className="text-lg text-muted-foreground">
                Hemos simplificado las herramientas que usan las grandes agencias para que tú puedas gestionar tus propiedades con la misma eficiencia, por una fracción del costo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Wallet className="text-emerald-500" />}
                title="Control Financiero"
                description="Visualiza ingresos, gastos y rentabilidad neta en tiempo real. Gráficos interactivos y balances automáticos."
              />
              <FeatureCard
                icon={<Users className="text-blue-500" />}
                title="Gestión de Inquilinos"
                description="Perfiles detallados, historial de pagos y alertas de impago. Todo organizado y fácil de encontrar."
              />
              <FeatureCard
                icon={<TrendingUp className="text-violet-500" />}
                title="Soporta Múltiples Monedas"
                description="¿Propiedades en diferentes países? Gestiona cobros en Euros, Dólares o tu moneda local sin problemas."
              />
              <FeatureCard
                icon={<ShieldCheck className="text-amber-500" />}
                title="Roles Accesibles"
                description="Da acceso limitado a 'Encargados' para que registren gastos sin ver tus datos financieros confidenciales."
              />
              <FeatureCard
                icon={<CheckCircle2 className="text-cyan-500" />}
                title="Importación Rápida"
                description="Sube tu Excel actual y migra todos tus datos (inquilinos, habitaciones) a Llavia en menos de 2 minutos."
              />
              <FeatureCard
                icon={<LayoutDashboard className="text-rose-500" />}
                title="Dashboard Intuitivo"
                description="Un resumen visual de la salud de tu cartera en cuanto inicias sesión. Cero curva de aprendizaje."
              />
            </div>
          </div>
        </section>

        {/* Pricing Section - Starter Focus */}
        <section id="pricing" className="py-24 bg-slate-50 dark:bg-slate-900/50">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Precios simples y transparentes</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Comienza gratis y mejora tu plan a medida que crece tu portafolio. Cero comisiones ocultas.
              </p>

              {/* Billing Toggle */}
              <div className="flex items-center justify-center gap-3">
                <span className={`text-sm font-medium ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>Mensual</span>
                <button
                  onClick={() => setIsAnnual(!isAnnual)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAnnual ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className={`text-sm font-medium ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Anual <span className="text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full ml-1">-20%</span>
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Starter Plan */}
              <Card className="p-8 relative border-border/50 hover:border-primary/50 transition-colors flex flex-col">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">Plan Starter</h3>
                  <p className="text-muted-foreground text-sm">Perfecto para empezar a organizar tus primeros alquileres.</p>
                </div>
                <div className="mb-6 flex items-baseline text-5xl font-extrabold">
                  ${isAnnual ? '9' : '15'}
                  <span className="text-lg text-muted-foreground font-medium ml-2">/mes</span>
                </div>
                <ul className="mb-8 space-y-4 flex-1">
                  <PricingFeature text="Hasta 5 propiedades/habitaciones" />
                  <PricingFeature text="Gestión de inquilinos básica" />
                  <PricingFeature text="Registro de ingresos y gastos" />
                  <PricingFeature text="Soporte por email" />
                </ul>
                <Link href="/login" className="mt-auto">
                  <Button variant="outline" className="w-full h-12 rounded-full font-semibold">Comenzar Gratis</Button>
                </Link>
              </Card>

              {/* Pro Plan */}
              <Card className="p-8 relative border-primary shadow-xl shadow-primary/10 flex flex-col">
                <div className="absolute top-0 right-8 -translate-y-1/2">
                  <span className="bg-gradient-to-r from-primary to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    Recomendado
                  </span>
                </div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">Plan Pro</h3>
                  <p className="text-muted-foreground text-sm">El software completo para propietarios en crecimiento.</p>
                </div>
                <div className="mb-6 flex items-baseline text-5xl font-extrabold">
                  ${isAnnual ? '29' : '39'}
                  <span className="text-lg text-muted-foreground font-medium ml-2">/mes</span>
                </div>
                <ul className="mb-8 space-y-4 flex-1">
                  <PricingFeature text="Propiedades y habitaciones Ilimitadas" />
                  <PricingFeature text="Roles de acceso (Encargados)" />
                  <PricingFeature text="Reportes financieros avanzados" />
                  <PricingFeature text="Importación/Exportación a Excel" />
                  <PricingFeature text="Soporte prioritario 24/7" />
                </ul>
                <Link href="/login" className="mt-auto">
                  <Button className="w-full h-12 rounded-full font-semibold shadow-md">Prueba Gratuita (14 días)</Button>
                </Link>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-24 bg-background border-t">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Propietarios en control</h2>
              <p className="text-lg text-muted-foreground">Únete a decenas de inversores que ya optimizaron su tiempo.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <TestimonialCard
                quote="Antes usaba 3 hojas de Excel distintas para seguir quién me había pagado. Con Llavia, veo los pendientes en segundos."
                name="Carlos R."
                role="Propietario de 12 pisos"
              />
              <TestimonialCard
                quote="El sistema de roles es genial. Mi encargado puede subir los gastos de plomería sin que yo tenga que darle las llaves de mis finanzas."
                name="María J."
                role="Inversora Inmobiliaria"
              />
              <TestimonialCard
                quote="La importación masiva me salvó. Pasé mis 40 habitaciones al sistema en una tarde. Altamente recomendado para coliving."
                name="Andrés M."
                role="Gestor de Coliving"
              />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 -z-10" />
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">¿Listo para modernizar tu gestión?</h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Configura tu cuenta en minutos. Importa tus datos hoy y empieza a disfrutar de la paz mental que da tener todo bajo control.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="px-10 h-14 text-lg rounded-full shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                  Comienza tu prueba gratis
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-card">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-sm">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 font-bold text-xl mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                <Building2 className="text-primary h-6 w-6" />
                <span>Llavia</span>
              </div>
              <p className="text-muted-foreground">
                El software diseñado para que los propietarios independientes recuperen el control de sus finanzas y su tiempo.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Producto</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li><Link href="#features" className="hover:text-primary transition-colors">Características</Link></li>
                <li><Link href="#pricing" className="hover:text-primary transition-colors">Precios</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Seguridad</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Recursos</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">Guía de inicio</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Centro de ayuda</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors">Privacidad</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Términos</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Contacto</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Llavia Software. Todos los derechos reservados.</p>
            <div className="flex items-center gap-1">
              Hecho con <span className="text-red-500">♥</span> para propietarios
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur-sm group">
      <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {React.cloneElement(icon as React.ReactElement<{ size: number }>, { size: 28 })}
      </div>
      <h3 className="text-xl font-bold mb-3 text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </Card>
  );
}

function PricingFeature({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 text-muted-foreground">
      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <Check className="h-3 w-3 text-primary font-bold" />
      </div>
      <span className="text-sm">{text}</span>
    </li>
  );
}

function TestimonialCard({ quote, name, role }: { quote: string, name: string, role: string }) {
  return (
    <Card className="p-8 border-border/50 bg-muted/20 relative">
      <Quote className="absolute top-6 right-6 text-primary/10 h-12 w-12" />
      <div className="flex gap-1 mb-6">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="text-foreground font-medium text-lg leading-relaxed mb-6">&quot;{quote}&quot;</p>
      <div>
        <h4 className="font-bold text-foreground">{name}</h4>
        <p className="text-sm text-muted-foreground">{role}</p>
      </div>
    </Card>
  );
}
