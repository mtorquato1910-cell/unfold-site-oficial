import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, GlassCard, StatusBadge, EmptyState } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Diagnostico() {
  const [items, setItems] = useState<any[]>([]);
  const [viewing, setViewing] = useState<any | null>(null);

  const load = async () => {
    const { data, error } = await supabase.from("diagnostico_results").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm("Excluir diagnóstico?")) return;
    const { error } = await supabase.from("diagnostico_results").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Excluído"); load(); }
  };

  return (
    <div>
      <PageHeader title="Diagnósticos" description="Resultados do diagnóstico de maturidade" />
      {items.length === 0 ? (
        <EmptyState title="Nenhum diagnóstico ainda" />
      ) : (
        <GlassCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-mint-soft text-dim font-mono text-[10px] uppercase tracking-wider">
                <tr><th className="text-left p-4">Empresa</th><th className="text-left p-4">Responsável</th><th className="text-left p-4">Score</th><th className="text-left p-4">Maturidade</th><th className="text-left p-4">Contato</th><th className="text-left p-4">Data</th><th className="p-4"></th></tr>
              </thead>
              <tbody>
                {items.map((d) => (
                  <tr key={d.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-4 font-medium">{d.company}</td>
                    <td className="p-4 text-dim-2">{d.responsible}<div className="text-xs text-dim">{d.email}</div></td>
                    <td className="p-4"><span className="font-mono text-primary text-base">{d.score}</span></td>
                    <td className="p-4 text-dim-2 text-xs">{d.maturity_level ?? "—"}</td>
                    <td className="p-4"><StatusBadge status={d.contact_status} /></td>
                    <td className="p-4 font-mono text-xs text-dim">{new Date(d.created_at).toLocaleDateString("pt-BR")}</td>
                    <td className="p-4 text-right">
                      <div className="inline-flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => setViewing(d)}><Eye className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => remove(d.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-2xl border-mint-soft bg-[hsl(var(--sidebar-bg))]">
          <DialogHeader><DialogTitle>{viewing?.company}</DialogTitle></DialogHeader>
          <div className="space-y-4 text-sm max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              <Info label="Responsável" value={viewing?.responsible} />
              <Info label="E-mail" value={viewing?.email} />
              <Info label="Telefone" value={viewing?.phone} />
              <Info label="Score" value={String(viewing?.score)} />
              <Info label="Maturidade" value={viewing?.maturity_level ?? "—"} />
              <Info label="Status" value={viewing?.contact_status} />
            </div>
            {viewing?.category_scores && (
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-dim mb-2">Pontuação por categoria</div>
                <pre className="rounded-md border border-mint-soft bg-white/[0.02] p-3 text-xs overflow-auto">{JSON.stringify(viewing.category_scores, null, 2)}</pre>
              </div>
            )}
            {viewing?.answers && (
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-dim mb-2">Respostas</div>
                <pre className="rounded-md border border-mint-soft bg-white/[0.02] p-3 text-xs overflow-auto max-h-64">{JSON.stringify(viewing.answers, null, 2)}</pre>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-wider text-dim">{label}</div>
      <div className="mt-1">{value ?? "—"}</div>
    </div>
  );
}
