import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader, GlassCard, EmptyState } from "@/components/admin/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function Users() {
  const { role: myRole } = useAuth();
  const [items, setItems] = useState<any[]>([]);

  const load = async () => {
    // join via two queries (RLS allows admins to read both)
    const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");
    const byUser = new Map((roles ?? []).map((r: any) => [r.user_id, r.role]));
    setItems((profiles ?? []).map((p: any) => ({ ...p, role: byUser.get(p.id) ?? null })));
  };
  useEffect(() => { load(); }, []);

  const updateRole = async (userId: string, role: "admin" | "editor") => {
    const { error: delErr } = await supabase.from("user_roles").delete().eq("user_id", userId);
    if (delErr) { toast.error(delErr.message); return; }
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
    if (error) toast.error(error.message); else { toast.success("Papel atualizado"); load(); }
  };

  if (myRole !== "admin") {
    return <EmptyState title="Acesso restrito" description="Somente admins podem gerenciar usuários" />;
  }

  return (
    <div>
      <PageHeader title="Usuários" description="Gerencie membros da equipe e seus papéis" />
      {items.length === 0 ? <EmptyState title="Nenhum usuário" /> : (
        <GlassCard className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-mint-soft text-dim font-mono text-[10px] uppercase tracking-wider">
              <tr><th className="text-left p-4">Nome</th><th className="text-left p-4">Idioma</th><th className="text-left p-4">Papel</th><th className="text-left p-4">Criado</th></tr>
            </thead>
            <tbody>
              {items.map((u) => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="p-4">
                    <div className="font-medium">{u.full_name ?? "—"}</div>
                    <div className="font-mono text-xs text-dim">{u.id.slice(0, 8)}</div>
                  </td>
                  <td className="p-4 text-dim-2">{u.language ?? "pt-BR"}</td>
                  <td className="p-4">
                    <Select value={u.role ?? "editor"} onValueChange={(v: any) => updateRole(u.id, v)}>
                      <SelectTrigger className="h-8 w-32 border-mint-soft bg-white/[0.02]"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="admin">admin</SelectItem><SelectItem value="editor">editor</SelectItem></SelectContent>
                    </Select>
                  </td>
                  <td className="p-4 font-mono text-xs text-dim">{new Date(u.created_at).toLocaleDateString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}
    </div>
  );
}
