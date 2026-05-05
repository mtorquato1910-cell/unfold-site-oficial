import { useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";

export default function Signup() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading) return null;
  if (session) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: `${window.location.origin}/admin`,
        data: { full_name: name },
      },
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Conta criada! Verifique seu e-mail.");
    navigate("/login");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background bg-mesh">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
      <div className="relative flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-in">
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
            <h2 className="mb-1 text-lg font-medium">Criar conta</h2>
            <p className="mb-6 text-sm text-dim-2">O primeiro usuário se torna admin</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-dim-2">Nome</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required className="h-11 border-mint-soft bg-white/[0.02]" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-dim-2">E-mail</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11 border-mint-soft bg-white/[0.02]" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-dim-2">Senha</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="h-11 border-mint-soft bg-white/[0.02]" />
              </div>
              <Button type="submit" disabled={busy} className="h-11 w-full bg-primary font-medium text-primary-foreground hover:bg-primary/90">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar conta"}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-dim">
              Já tem conta?{" "}
              <Link to="/login" className="text-primary hover:underline">Entrar</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
