import { signIn } from "@/lib/auth";

export default function LoginPage() {
  async function handleLogin(formData: FormData) {
    "use server";
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="glass p-8 rounded-2xl shadow-2xl w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600 dark:from-indigo-400 dark:to-pink-400">
            Gravity Rent
          </h1>
          <p className="text-muted-foreground mt-2">Bienvenido de nuevo</p>
        </div>

        <form action={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input
              name="email"
              type="email"
              placeholder="admin@example.com"
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
            className="w-full py-3 px-4 bg-primary text-primary-foreground font-bold rounded-lg shadow-lg hover:shadow-primary/50 hover:-translate-y-0.5 transition-all duration-200"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}
