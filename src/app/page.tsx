import Link from 'next/link';
import React from 'react';
import { Button, Card } from '@/components/ui/shared';
import {
  Building2,
  Users,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  LayoutDashboard,
  Wallet
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
          <div className="flex items-center gap-2 font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            <Building2 className="text-primary" />
            <span>Llavia</span>
          </div>
          <nav className="flex gap-4">
            <Link href="/login">
              <Button>Iniciar Sesión</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          <div className="container mx-auto px-4 max-w-5xl text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-in fade-in slide-in-from-bottom-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Nuevo: Importación masiva de Inquilinos y Propiedades por Excel
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white animate-in fade-in slide-in-from-bottom-6 duration-700">
              Gestión Inteligente para <br className="hidden md:block" />
              <span className="text-primary">Tu Patrimonio Inmobiliario</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
              Olvídate del caos de los excels y los recibos perdidos.
              Centraliza inquilinos, contratos, gastos y rentabilidad en una sola plataforma moderna y segura.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200">
              <Link href="/login">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8 h-12 gap-2 shadow-lg shadow-primary/25">
                  Empezar Ahora <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 h-12">
                  Ver Funcionalidades
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-20 bg-slate-50 dark:bg-slate-900/50">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Todo lo que necesitas para escalar</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Diseñado para propietarios que buscan profesionalizar su gestión sin complicaciones innecesarias.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Wallet className="text-emerald-500" />}
                title="Control Financiero Total"
                description="Visualiza ingresos, gastos y rentabilidad neta en tiempo real. Gráficos claros y métricas clave."
              />
              <FeatureCard
                icon={<Users className="text-blue-500" />}
                title="Gestión de Inquilinos"
                description="Importa listados desde Excel, gestiona perfiles detallados e historiales de pagos en un solo lugar."
              />
              <FeatureCard
                icon={<TrendingUp className="text-violet-500" />}
                title="Gastos y Mantenimiento"
                description="Registra incidencias, aprueba presupuestos y mantén tus propiedades en perfecto estado."
              />
              <FeatureCard
                icon={<ShieldCheck className="text-amber-500" />}
                title="Roles y Permisos"
                description="Delega en Encargados con acceso limitado o gestiona todo tú mismo con el rol de Casero."
              />
              <FeatureCard
                icon={<LayoutDashboard className="text-rose-500" />}
                title="Dashboard Intuitivo"
                description="Toda la información importante de un vistazo. Alertas de impagos, vencimientos y ocupación."
              />
              <FeatureCard
                icon={<CheckCircle2 className="text-cyan-500" />}
                title="Automatización"
                description="Generación de recibos, recordatorios de cobro y finalización de contratos automáticos."
              />
            </div>
          </div>
        </section>

        {/* Call to Action Footer-ish */}
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <Card className="p-12 bg-primary/5 border-primary/20 relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-4">¿Listo para retomar el control?</h2>
                <p className="text-muted-foreground mb-8 text-lg">
                  Únete a la gestión moderna de propiedades. Accede a tu panel ahora mismo.
                </p>
                <Link href="/login">
                  <Button size="lg" className="px-10 h-14 text-lg shadow-xl shadow-primary/20">
                    Ir al Panel de Control
                  </Button>
                </Link>
              </div>
              {/* Decorative bg elements */}
              <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 bg-purple-500/10 rounded-full blur-3xl" />
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 bg-card text-muted-foreground text-sm">
        <div className="container mx-auto px-4 max-w-6xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Building2 size={16} />
            <span className="font-semibold">Llavia</span>
          </div>
          <p>© {new Date().getFullYear()} Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-foreground transition-colors">Privacidad</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Términos</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Contacto</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-transparent hover:border-border/50">
      <div className="h-12 w-12 rounded-xl bg-background border shadow-sm flex items-center justify-center mb-4">
        {React.cloneElement(icon as React.ReactElement<{ size: number }>, { size: 24 })}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </Card>
  );
}
