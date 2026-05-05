import { useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";

export default function Login() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading) return null;
  if (session) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error(error.message === "Invalid login credentials" ? "Credenciais inválidas" : error.message);
      return;
    }
    toast.success("Bem-vindo");
    navigate("/admin");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background bg-mesh">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-accent-blue/10 blur-[120px]" />

      <div className="relative flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-in">
          {/* Logo */}
          <div className="mb-10 flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Unfold Growth</h1>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-dim font-mono">Painel Admin</p>
            </div>
          </div>

          <div className="glass rounded-2xl p-8">
            <h2 className="mb-1 text-lg font-medium">Acessar painel</h2>
            <p className="mb-6 text-sm text-dim-2">Entre com suas credenciais</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs uppercase tracking-wider text-dim-2">E-mail</Label>
                <Input
                  id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="h-11 border-mint-soft bg-white/[0.02] focus-visible:border-primary/50 focus-visible:ring-primary/20"
                  placeholder="voce@unfoldgrowth.com"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs uppercase tracking-wider text-dim-2">Senha</Label>
                  <Link to="/forgot-password" className="text-xs text-primary hover:text-primary/80">Esqueci minha senha</Link>
                </div>
                <Input
                  id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="h-11 border-mint-soft bg-white/[0.02] focus-visible:border-primary/50 focus-visible:ring-primary/20"
                  placeholder="••••••••"
                />
              </div>
              <Button
                type="submit" disabled={busy}
                className="h-11 w-full bg-primary font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_30px_hsl(158_92%_70%_/_0.3)]"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-dim">
              Não tem conta?{" "}
              <Link to="/signup" className="text-primary hover:underline">Criar conta</Link>
            </p>
          </div>

          <p className="mt-8 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-dim">
            © Unfold Growth · 2026
          </p>
        </div>
      </div>
    </div>
  );
}
