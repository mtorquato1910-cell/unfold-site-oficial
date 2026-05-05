import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, GlassCard, StatusBadge, EmptyState } from "@/components/admin/ui";
import { Mail, Phone, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

export default function Leads() {
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [viewing, setViewing] = useState<any | null>(null);
  const [notes, setNotes] = useState("");

  const load = async () => {
    const q = supabase.from("leads").select("*").order("created_at", { ascending: false });
    const { data, error } = filter === "all" ? await q : await q.eq("status", filter);
    if (error) toast.error(error.message);
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("leads").update({ status }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Status atualizado"); load(); }
  };

  const saveNotes = async () => {
    if (!viewing) return;
    const { error } = await supabase.from("leads").update({ notes }).eq("id", viewing.id);
    if (error) toast.error(error.message); else { toast.success("Notas salvas"); setViewing(null); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir lead?")) return;
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Excluído"); load(); }
  };

  return (
    <div>
      <PageHeader
        title="Leads" description="Contatos capturados pelo site"
        actions={
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-44 border-mint-soft bg-white/[0.02]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="new">Novos</SelectItem>
              <SelectItem value="contacted">Contatados</SelectItem>
              <SelectItem value="qualified">Qualificados</SelectItem>
              <SelectItem value="converted">Convertidos</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {items.length === 0 ? (
        <EmptyState title="Nenhum lead encontrado" />
      ) : (
        <GlassCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-mint-soft text-dim font-mono text-[10px] uppercase tracking-wider">
                <tr><th className="text-left p-4">Nome</th><th className="text-left p-4">Contato</th><th className="text-left p-4">Origem</th><th className="text-left p-4">Status</th><th className="text-left p-4">Data</th><th className="p-4"></th></tr>
              </thead>
              <tbody>
                {items.map((l) => (
                  <tr key={l.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-4"><div className="font-medium">{l.name}</div></td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-xs text-dim-2"><Mail className="h-3 w-3" />{l.email}</div>
                      {l.phone && <div className="flex items-center gap-2 text-xs text-dim-2 mt-1"><Phone className="h-3 w-3" />{l.phone}</div>}
                    </td>
                    <td className="p-4 text-dim-2 text-xs">{l.source}</td>
                    <td className="p-4">
                      <Select value={l.status} onValueChange={(v) => updateStatus(l.id, v)}>
                        <SelectTrigger className="h-7 w-32 border-0 bg-transparent p-0 [&>svg]:hidden">
                          <StatusBadge status={l.status} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">new</SelectItem><SelectItem value="contacted">contacted</SelectItem>
                          <SelectItem value="qualified">qualified</SelectItem><SelectItem value="converted">converted</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-4 font-mono text-xs text-dim">{new Date(l.created_at).toLocaleDateString("pt-BR")}</td>
                    <td className="p-4 text-right">
                      <div className="inline-flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => { setViewing(l); setNotes(l.notes ?? ""); }}><Eye className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => remove(l.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
        <DialogContent className="border-mint-soft bg-[hsl(var(--sidebar-bg))]">
          <DialogHeader><DialogTitle>{viewing?.name}</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <div><span className="text-dim">E-mail:</span> {viewing?.email}</div>
            {viewing?.phone && <div><span className="text-dim">Telefone:</span> {viewing.phone}</div>}
            <div><span className="text-dim">Origem:</span> {viewing?.source}</div>
            {viewing?.data && Object.keys(viewing.data).length > 0 && (
              <pre className="rounded-md border border-mint-soft bg-white/[0.02] p-3 text-xs overflow-auto">{JSON.stringify(viewing.data, null, 2)}</pre>
            )}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-dim-2">Notas</Label>
              <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setViewing(null)}>Fechar</Button>
            <Button onClick={saveNotes} className="bg-primary text-primary-foreground hover:bg-primary/90">Salvar notas</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
