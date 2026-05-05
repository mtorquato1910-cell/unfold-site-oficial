import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Verifique seu e-mail para redefinir a senha");
  };

  return (
    <div className="relative min-h-screen bg-background bg-mesh">
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link to="/login" className="mb-6 inline-flex items-center gap-2 text-xs text-dim-2 hover:text-foreground">
            <ArrowLeft className="h-3 w-3" /> Voltar ao login
          </Link>
          <div className="glass rounded-2xl p-8">
            <h2 className="mb-1 text-lg font-medium">Esqueci minha senha</h2>
            <p className="mb-6 text-sm text-dim-2">Enviaremos um link de redefinição</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-dim-2">E-mail</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11 border-mint-soft bg-white/[0.02]" />
              </div>
              <Button type="submit" disabled={busy} className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar link"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
