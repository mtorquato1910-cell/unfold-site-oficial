import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, GlassCard, EmptyState } from "@/components/admin/ui";
import { Activity, User, Database } from "lucide-react";

export default function Audit() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("audit_log").select("*").order("created_at", { ascending: false }).limit(200);
      setItems(data ?? []);
    })();
  }, []);

  return (
    <div className="max-w-5xl">
      <PageHeader
        eyebrow="Sistema" title="Log de Auditoria"
        description="Histórico de ações realizadas no painel pelos usuários da equipe."
      />
      {items.length === 0 ? (
        <EmptyState icon={Activity} title="Sem registros ainda" description="As ações realizadas no painel aparecerão aqui." />
      ) : (
        <GlassCard className="p-0 overflow-hidden">
          <div className="divide-y divide-white/[0.04]">
            {items.map((a) => (
              <div key={a.id} className="flex items-start gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/15 shrink-0">
                  <Database className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-primary/90">{a.action}</span>
                    {a.resource_type && <span className="font-mono text-[10px] text-dim-2">{a.resource_type}{a.resource_id && `#${String(a.resource_id).slice(0, 8)}`}</span>}
                  </div>
                  <div className="text-[12px] text-dim-2 mt-1 flex items-center gap-1.5">
                    <User className="h-3 w-3" /> {a.user_email ?? a.user_id?.slice(0, 8) ?? "—"}
                  </div>
                </div>
                <div className="font-mono text-[10px] text-dim shrink-0">
                  {new Date(a.created_at).toLocaleString("pt-BR")}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
